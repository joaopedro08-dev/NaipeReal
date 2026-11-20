import { describe, expect, it } from "vitest"
import type { GameStateDto, HintsDto } from "../../src/adapters/socket/contract.js"
import type { AnyGameRules } from "../../src/domain/room/game-rules.js"
import type { Seat } from "../../src/domain/shared/seat.js"
import { gameAdapters, gameCatalog } from "../../src/main/container.js"
import { canAct, chooseBotAction, tableOpensAt } from "../../perf/bot-strategy.js"
import { seededRandom, unwrap } from "../support/game-builder.js"

const SEEDS = 3
const MAX_STEPS = 20_000

const seatsFor = (rules: AnyGameRules): readonly Seat[] => {
  const count = Math.max(...rules.playerCounts.filter((players) => players <= 4))
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    nickname: `P${index}`,
    team: rules.teamCount === null ? null : index % rules.teamCount,
  }))
}

interface Outcome {
  readonly finished: boolean
  readonly botMoves: number
  readonly refusals: number
}

const playWithBots = (rules: AnyGameRules, seed: number): Outcome => {
  const adapter = gameAdapters.find(rules.id)
  if (!adapter) throw new Error(`Sem adaptador: ${rules.id}`)
  const random = seededRandom(seed)
  const seats = seatsFor(rules)
  let state = unwrap(rules.start(seats, seats[0]?.id ?? "p0", random))
  let botMoves = 0
  let refusals = 0
  for (let step = 0; step < MAX_STEPS && !rules.isFinished(state); step++) {
    const present = adapter.presenter(state)
    const actor = seats.find((seat) => canAct(present(seat.id) as GameStateDto, seat.id))
    if (!actor) {
      state = rules.expireTurn(state, random)
      continue
    }
    const view = present(actor.id) as GameStateDto
    const hints = adapter.hints(state, actor.id) as HintsDto
    const action = chooseBotAction(view, hints)
    const played = action === null ? null : rules.play(state, actor.id, action, random)
    if (played?.ok) {
      state = played.value
      botMoves += 1
    } else {
      refusals += 1
      state = rules.expireTurn(state, random)
    }
  }
  return { finished: rules.isFinished(state), botMoves, refusals }
}

describe("bots do teste de carga", () => {
  it.each(gameCatalog.games.map((rules) => [rules.id, rules] as const))(
    "jogam %s até o fim com jogadas aceitas pelo servidor",
    (_id, rules) => {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const outcome = playWithBots(rules, seed)
        expect(outcome.finished).toBe(true)
        expect(outcome.botMoves).toBeGreaterThan(0)
        expect(outcome.refusals).toBe(0)
      }
    }
  )
})

describe("relógio da mesa para os bots", () => {
  const room = { serverNow: 10_000, matchStartsAt: null, pausedUntil: null, pausedAt: null }

  it("espera a contagem e a pausa da mesa no relógio local", () => {
    expect(tableOpensAt(room, 500)).toBe(500)
    expect(tableOpensAt({ ...room, matchStartsAt: 13_000 }, 500)).toBe(3_500)
    expect(tableOpensAt({ ...room, matchStartsAt: 11_000, pausedUntil: 12_500 }, 500)).toBe(3_000)
  })

  it("não joga com a mesa pausada pelo anfitrião", () => {
    expect(tableOpensAt({ ...room, pausedAt: 9_000 }, 500)).toBe(Number.POSITIVE_INFINITY)
  })
})
