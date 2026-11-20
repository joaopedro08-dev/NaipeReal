import type { GameStateDto, HintsDto, RoomStateDto } from "../src/adapters/socket/contract.js"
import type { PlayerId } from "../src/domain/shared/seat.js"

export type BotAction = { readonly type: string } & Readonly<Record<string, unknown>>

const anyMove = (moves: object): boolean =>
  Object.values(moves).some((move) => move !== false && move !== null && move !== 0)

export const canAct = (game: GameStateDto | null, playerId: PlayerId): boolean => {
  if (!game) return false
  if (game.kind === "rouba-monte") return game.currentPlayerId === playerId
  return anyMove(game.moves)
}

const STRONG_POKER_HANDS = new Set([
  "twoPair",
  "threeOfAKind",
  "straight",
  "flush",
  "fullHouse",
  "fourOfAKind",
  "straightFlush",
  "royalFlush",
])

const pokerAction = (
  game: Extract<GameStateDto, { kind: "poker-texas-holdem" }>,
  hints: HintsDto | null
): BotAction => {
  const { moves } = game
  const category = hints?.kind === "poker-texas-holdem" ? hints.current?.category : undefined
  const strong = category !== undefined && STRONG_POKER_HANDS.has(category)
  if (strong && moves.raise) return { type: "raise", amount: moves.raise.max }
  if (strong && moves.bet) return { type: "bet", amount: moves.bet.max }
  if (moves.check) return { type: "check" }
  if (moves.call !== null) return { type: "call" }
  return { type: "fold" }
}

const blackjackAction = (
  game: Extract<GameStateDto, { kind: "blackjack" }>,
  hints: HintsDto | null
): BotAction | null => {
  const { moves } = game
  if (moves.bet) return { type: "bet", amount: moves.bet.min }
  if (moves.insurance) return { type: "insurance", accepted: false }
  const advised = hints?.kind === "blackjack" ? hints.advice?.action : undefined
  if (advised) return advised
  return moves.stand ? { type: "stand" } : null
}

const trucoAction = (
  game: Extract<GameStateDto, { kind: "truco-paulista" }>,
  hints: HintsDto | null
): BotAction | null => {
  const suggested = hints?.kind === "truco-paulista" ? hints.suggestions[0]?.action : undefined
  if (suggested) return suggested
  const { moves, hand } = game
  if (moves.answer || moves.decideEleven) return { type: "accept" }
  if (!moves.play) return null
  const [card] = hand
  return game.blind || !card ? { type: "playBlind", slot: 0 } : { type: "play", card }
}

const trincasAction = (
  game: Extract<GameStateDto, { kind: "tres-trincas" }>,
  hints: HintsDto | null
): BotAction | null => {
  const suggested = hints?.kind === "tres-trincas" ? hints.suggestions[0]?.action : undefined
  if (suggested) return suggested
  if (game.moves.draw) return { type: "draw" }
  const [card] = game.hand
  return game.moves.discard && card ? { type: "discard", card } : null
}

const cachetaAction = (
  game: Extract<GameStateDto, { kind: "cacheta" }>,
  hints: HintsDto | null
): BotAction | null => {
  const suggested = hints?.kind === "cacheta" ? hints.suggestions[0]?.action : undefined
  if (suggested) return suggested
  if (game.moves.draw) return { type: "draw" }
  const [card] = game.hand
  return game.moves.discard && card ? { type: "discard", card } : null
}

export const chooseBotAction = (
  game: GameStateDto | null,
  hints: HintsDto | null
): BotAction | null => {
  switch (game?.kind) {
    case "rouba-monte":
      return hints?.kind === "rouba-monte" ? (hints.plays[0]?.action ?? null) : null
    case "truco-paulista":
      return trucoAction(game, hints)
    case "tres-trincas":
      return trincasAction(game, hints)
    case "poker-texas-holdem":
      return pokerAction(game, hints)
    case "cacheta":
      return cachetaAction(game, hints)
    case "blackjack":
      return blackjackAction(game, hints)
    default:
      return null
  }
}

type TableClock = Pick<RoomStateDto, "serverNow" | "matchStartsAt" | "pausedUntil" | "pausedAt">

export const tableOpensAt = (room: TableClock, receivedAt: number): number => {
  if (room.pausedAt !== null) return Number.POSITIVE_INFINITY
  const wait = Math.max(
    0,
    (room.matchStartsAt ?? 0) - room.serverNow,
    (room.pausedUntil ?? 0) - room.serverNow
  )
  return receivedAt + wait
}
