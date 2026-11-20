import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { monitorEventLoopDelay } from "node:perf_hooks"
import { setTimeout as sleep } from "node:timers/promises"
import { fileURLToPath } from "node:url"
import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import type { Ack, HintsDto, RoomStateDto, SeatDto } from "../src/adapters/socket/contract.js"
import { gameCatalog } from "../src/main/container.js"
import { canAct, chooseBotAction, tableOpensAt } from "./bot-strategy.js"
import type { BotAction } from "./bot-strategy.js"
import { percentile, readServerSample } from "./server-sample.js"
import type { ServerSample } from "./server-sample.js"

const env = process.env
const TARGET = env["TARGET_URL"] ?? "http://localhost:3000"
const METRICS = env["METRICS_URL"] ?? "http://localhost:9464/metrics"
const STEPS = (env["ROOM_STEPS"] ?? "10").split(",").map(Number)
const PLAYERS_PER_ROOM = Number(env["PLAYERS_PER_ROOM"] ?? 6)
const STEP_SECONDS = Number(env["STEP_SECONDS"] ?? 60)
const THINK_MS = Number(env["THINK_MS"] ?? 1000)
const CONNECT_BATCH = Number(env["CONNECT_BATCH"] ?? 30)
const SETTLE_SECONDS = Number(env["SETTLE_SECONDS"] ?? 10)
const LABEL = env["LABEL"] ?? "run"
const GAMES = (env["GAMES"] || gameCatalog.games.map((game) => game.id).join(","))
  .split(",")
  .map((gameId) => gameId.trim())
  .filter((gameId) => gameId.length > 0)
const SLO_BROADCAST_P95_MS = 1000
const ACK_TIMEOUT_MS = 10_000

interface GameRecord {
  broadcastMs: number[]
  commands: number
  gamesFinished: number
}

interface Recorder {
  ackMs: number[]
  broadcastMs: number[]
  commands: number
  rejected: Record<string, number>
  gamesFinished: number
  stalledRooms: number
  byGame: Record<string, GameRecord>
}

const unknownGame = (gameId: string): never => {
  throw new Error(`Jogo desconhecido em GAMES: ${gameId}`)
}

const seatsFor = (gameId: string): number => {
  const rules = gameCatalog.find(gameId) ?? unknownGame(gameId)
  const fitting = rules.playerCounts.filter((count) => count <= PLAYERS_PER_ROOM)
  return Math.max(...(fitting.length > 0 ? fitting : [Math.min(...rules.playerCounts)]))
}

const gameRecordOf = (recorder: Recorder, gameId: string): GameRecord => {
  recorder.byGame[gameId] ??= { broadcastMs: [], commands: 0, gamesFinished: 0 }
  return recorder.byGame[gameId]
}

const request = <T>(socket: Socket, event: string, payload?: unknown): Promise<Ack<T>> =>
  new Promise((resolve) => {
    const client = socket.timeout(ACK_TIMEOUT_MS)
    const settle = (failure: Error | null, ack: Ack<T>) =>
      resolve(
        failure ? { ok: false, error: { code: "ACK_TIMEOUT", message: failure.message } } : ack
      )
    if (payload === undefined) client.emit(event, settle)
    else client.emit(event, payload, settle)
  })

class Bot {
  state: RoomStateDto | null = null
  playerId = ""
  private opensAt = 0

  constructor(readonly socket: Socket) {}

  receive(state: RoomStateDto): void {
    this.state = state
    this.opensAt = tableOpensAt(state, Date.now())
  }

  get myTurn(): boolean {
    return (
      this.state?.status === "playing" &&
      Date.now() >= this.opensAt &&
      canAct(this.state.game, this.playerId)
    )
  }
}

class BotRoom {
  readonly bots: Bot[] = []
  private pending: { sentAt: number; baseVersion: number; waiting: Set<Bot> } | null = null
  private stopped = false
  private lastTurn = 0
  private readonly record: GameRecord

  constructor(
    private readonly recorder: Recorder,
    readonly gameId: string
  ) {
    this.record = gameRecordOf(recorder, gameId)
  }

  async join(index: number): Promise<void> {
    const seats = seatsFor(this.gameId)
    for (let seat = 0; seat < seats; seat++) {
      const bot = await this.connectBot()
      this.bots.push(bot)
      const nickname = `B${index}-${seat}`
      const first = this.bots[0] as Bot
      const ack =
        seat === 0
          ? await request<SeatDto>(bot.socket, "room:create", { nickname, gameId: this.gameId })
          : await request<SeatDto>(bot.socket, "room:join", {
              code: first.state?.code,
              nickname,
            })
      if (!ack.ok) throw new Error(ack.error.code)
      bot.playerId = ack.data.playerId
    }
  }

  async run(): Promise<void> {
    const host = this.bots[0] as Bot
    await this.command(host, "game:start")
    while (!this.stopped) {
      const active = this.bots.find((bot) => bot.myTurn)
      if (host.state?.status === "finished") {
        this.recorder.gamesFinished++
        this.record.gamesFinished++
        await sleep(THINK_MS)
        await this.command(host, "game:start")
        continue
      }
      if (!active) {
        await sleep(20)
        continue
      }
      await this.playTurn(active)
    }
  }

  stop(): void {
    this.stopped = true
    for (const bot of this.bots) bot.socket.disconnect()
  }

  private async connectBot(): Promise<Bot> {
    const socket = io(TARGET, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      timeout: 60_000,
    })
    const bot = new Bot(socket)
    socket.on("room:state", (state: RoomStateDto) => {
      bot.receive(state)
      this.markDelivered(bot, state)
    })
    await new Promise<void>((done, fail) => {
      socket.once("connect", done)
      socket.once("connect_error", fail)
    })
    return bot
  }

  private markDelivered(bot: Bot, state: RoomStateDto): void {
    const pending = this.pending
    if (!pending || state.version <= pending.baseVersion || !pending.waiting.delete(bot)) return
    const elapsed = performance.now() - pending.sentAt
    this.recorder.broadcastMs.push(elapsed)
    this.record.broadcastMs.push(elapsed)
  }

  private async playTurn(bot: Bot): Promise<void> {
    const turn = bot.state?.game?.turnNumber ?? 0
    if (turn === this.lastTurn) this.recorder.stalledRooms++
    this.lastTurn = turn
    for (let step = 0; step < 2 && !this.stopped && bot.myTurn; step++) {
      await sleep(THINK_MS)
      const action = await this.chooseAction(bot)
      if (!action) break
      await this.command(bot, "game:action", action, true)
    }
  }

  private async chooseAction(bot: Bot): Promise<BotAction | null> {
    const hints = await this.command<HintsDto>(bot, "game:hints")
    if (!bot.myTurn) return null
    return chooseBotAction(bot.state?.game ?? null, hints)
  }

  private async command<T>(
    bot: Bot,
    event: string,
    payload?: unknown,
    trackBroadcast = false
  ): Promise<T | null> {
    const sentAt = performance.now()
    if (trackBroadcast) {
      this.pending = {
        sentAt,
        baseVersion: bot.state?.version ?? 0,
        waiting: new Set(this.bots.filter((peer) => peer !== bot)),
      }
    }
    const ack = await request<T>(bot.socket, event, payload)
    this.recorder.ackMs.push(performance.now() - sentAt)
    this.recorder.commands++
    this.record.commands++
    if (ack.ok) return ack.data
    this.recorder.rejected[ack.error.code] = (this.recorder.rejected[ack.error.code] ?? 0) + 1
    return null
  }
}

const summarize = (values: number[]) => {
  const sorted = values.toSorted((first, second) => first - second)
  const at = (p: number) => Number(percentile(sorted, p).toFixed(2))
  return { count: sorted.length, p50: at(50), p95: at(95), p99: at(99), max: at(100) }
}

const newRecorder = (): Recorder => ({
  ackMs: [],
  broadcastMs: [],
  commands: 0,
  rejected: {},
  gamesFinished: 0,
  stalledRooms: 0,
  byGame: {},
})

const cpuPercent = (first: ServerSample, last: ServerSample, seconds: number): number =>
  Number((((last.cpuSeconds - first.cpuSeconds) / seconds) * 100).toFixed(1))

const runStep = async (roomCount: number) => {
  const recorder = newRecorder()
  const rooms = Array.from(
    { length: roomCount },
    (_, index) => new BotRoom(recorder, GAMES[index % GAMES.length] as string)
  )
  const connectStartedAt = performance.now()
  for (let start = 0; start < rooms.length; start += CONNECT_BATCH) {
    await Promise.all(
      rooms.slice(start, start + CONNECT_BATCH).map((room, offset) => room.join(start + offset))
    )
  }
  const connectSeconds = (performance.now() - connectStartedAt) / 1000
  const idle = await readServerSample(METRICS)

  const generatorLag = monitorEventLoopDelay({ resolution: 10 })
  generatorLag.enable()
  const running = rooms.map((room) => room.run().catch(() => undefined))

  await sleep(SETTLE_SECONDS * 1000)
  recorder.ackMs.length = 0
  recorder.broadcastMs.length = 0
  recorder.commands = 0
  for (const record of Object.values(recorder.byGame)) {
    record.broadcastMs.length = 0
    record.commands = 0
  }
  const first = await readServerSample(METRICS)
  const startedAt = performance.now()

  await sleep(STEP_SECONDS * 1000)

  const last = await readServerSample(METRICS)
  const elapsed = (performance.now() - startedAt) / 1000
  const ack = summarize(recorder.ackMs)
  const broadcast = summarize(recorder.broadcastMs)
  const commands = recorder.commands
  const rejected = { ...recorder.rejected }
  const gamesFinished = recorder.gamesFinished
  const byGame = Object.fromEntries(
    Object.entries(recorder.byGame).map(([gameId, record]) => [
      gameId,
      {
        rooms: rooms.filter((room) => room.gameId === gameId).length,
        commandsPerSecond: Number((record.commands / elapsed).toFixed(1)),
        broadcastMs: summarize(record.broadcastMs),
        gamesFinished: record.gamesFinished,
      },
    ])
  )
  generatorLag.disable()

  rooms.forEach((room) => room.stop())
  await Promise.all(running)

  return {
    rooms: roomCount,
    players: rooms.reduce((total, room) => total + room.bots.length, 0),
    games: GAMES,
    thinkMs: THINK_MS,
    connectSeconds: Number(connectSeconds.toFixed(1)),
    commandsPerSecond: Number((commands / elapsed).toFixed(1)),
    stateMessagesPerSecond: Number(
      ((last.stateMessages - first.stateMessages) / elapsed).toFixed(1)
    ),
    ackMs: ack,
    broadcastMs: broadcast,
    sloBroadcastP95Ok: broadcast.p95 <= SLO_BROADCAST_P95_MS,
    gamesFinished,
    byGame,
    rejected,
    server: {
      cpuPercent: cpuPercent(first, last, elapsed),
      rssMb: Number((last.rssBytes / 1048576).toFixed(1)),
      heapUsedMb: Number((last.heapBytes / 1048576).toFixed(1)),
      idleRssMb: Number((idle.rssBytes / 1048576).toFixed(1)),
      eventLoopLagP99Ms: Number((last.eventLoopLagP99Seconds * 1000).toFixed(2)),
      connections: last.connections,
    },
    generator: {
      eventLoopLagP99Ms: Number((generatorLag.percentile(99) / 1e6).toFixed(2)),
    },
  }
}

const results = []
for (const roomCount of STEPS) {
  console.log(
    `\n>> ${roomCount} salas de ${GAMES.join(", ")}, até ${PLAYERS_PER_ROOM} jogadores, ${STEP_SECONDS}s`
  )
  const result = await runStep(roomCount)
  console.log(JSON.stringify(result))
  results.push(result)
  await sleep(5000)
}

const outputDir = resolve(dirname(fileURLToPath(import.meta.url)), "results")
mkdirSync(outputDir, { recursive: true })
const output = resolve(outputDir, `${LABEL}.json`)
writeFileSync(output, JSON.stringify({ label: LABEL, target: TARGET, results }, null, 2))

console.table(
  results.map((result) => ({
    salas: result.rooms,
    jogadores: result.players,
    "cmd/s": result.commandsPerSecond,
    "msg/s": result.stateMessagesPerSecond,
    "ack p95": result.ackMs.p95,
    "broadcast p95": result.broadcastMs.p95,
    "broadcast p99": result.broadcastMs.p99,
    "cpu %": result.server.cpuPercent,
    "rss MB": result.server.rssMb,
    "lag p99": result.server.eventLoopLagP99Ms,
    "lag gerador": result.generator.eventLoopLagP99Ms,
    SLO: result.sloBroadcastP95Ok ? "ok" : "FALHOU",
  }))
)

console.table(
  results.flatMap((result) =>
    Object.entries(result.byGame).map(([gameId, game]) => ({
      salas: result.rooms,
      jogo: gameId,
      "salas do jogo": game.rooms,
      "cmd/s": game.commandsPerSecond,
      "broadcast p95": game.broadcastMs.p95,
      "broadcast p99": game.broadcastMs.p99,
      partidas: game.gamesFinished,
    }))
  )
)
process.exit(0)
