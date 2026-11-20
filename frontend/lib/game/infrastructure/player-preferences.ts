import { GAMES } from "@/lib/game/domain/catalog"
import type { GameId } from "@/lib/game/domain/types"

const STORAGE_KEY = "naipe-real:preferencias"
export const PREFERENCES_EVENT = "naipe-real:preferences"

export interface PlayerPreferences {
  readonly nickname: string
  readonly tutorialsSeen: Partial<Record<GameId, true>>
  readonly tutorialAutoOpen: boolean
  readonly showRoomCodeByDefault: boolean
  readonly soundsEnabled: boolean
  readonly reducedMotion: boolean
  readonly cardSize: "normal" | "large"
}

export type PreferencesPatch = Partial<PlayerPreferences>

const defaultPreferences: PlayerPreferences = {
  nickname: "",
  tutorialsSeen: {},
  tutorialAutoOpen: true,
  showRoomCodeByDefault: false,
  soundsEnabled: false,
  reducedMotion: false,
  cardSize: "normal",
}

const KNOWN_GAMES = new Set<string>(GAMES.map((game) => game.id))

const booleanOr = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback

const tutorialsOf = (value: unknown): Partial<Record<GameId, true>> => {
  if (typeof value !== "object" || value === null) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      ([gameId, seen]) => KNOWN_GAMES.has(gameId) && seen === true
    )
  ) as Partial<Record<GameId, true>>
}

const parsePreferences = (value: unknown): PlayerPreferences => {
  if (typeof value !== "object" || value === null) return defaultPreferences
  const stored = value as Record<string, unknown>
  return {
    nickname: typeof stored.nickname === "string" ? stored.nickname : "",
    tutorialsSeen: tutorialsOf(stored.tutorialsSeen),
    tutorialAutoOpen: booleanOr(
      stored.tutorialAutoOpen,
      defaultPreferences.tutorialAutoOpen
    ),
    showRoomCodeByDefault: booleanOr(
      stored.showRoomCodeByDefault,
      defaultPreferences.showRoomCodeByDefault
    ),
    soundsEnabled: booleanOr(
      stored.soundsEnabled,
      defaultPreferences.soundsEnabled
    ),
    reducedMotion: booleanOr(
      stored.reducedMotion,
      defaultPreferences.reducedMotion
    ),
    cardSize: stored.cardSize === "large" ? "large" : "normal",
  }
}

export const loadPlayerPreferences = (): PlayerPreferences => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? parsePreferences(JSON.parse(stored)) : defaultPreferences
  } catch {
    return defaultPreferences
  }
}

export const savePlayerPreferences = (patch: PreferencesPatch): void => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...loadPlayerPreferences(), ...patch })
    )
  } catch {
    return
  }
}

export const updatePlayerPreferences = (patch: PreferencesPatch): void => {
  savePlayerPreferences(patch)
  window.dispatchEvent(new Event(PREFERENCES_EVENT))
}

export const subscribeToPreferences = (listener: () => void): (() => void) => {
  window.addEventListener("storage", listener)
  window.addEventListener(PREFERENCES_EVENT, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(PREFERENCES_EVENT, listener)
  }
}

export const hasSeenTutorial = (gameId: GameId): boolean =>
  loadPlayerPreferences().tutorialsSeen[gameId] === true

export const markTutorialSeen = (gameId: GameId): void =>
  savePlayerPreferences({
    tutorialsSeen: { ...loadPlayerPreferences().tutorialsSeen, [gameId]: true },
  })

export const markAllTutorialsSeen = (): void =>
  savePlayerPreferences({
    tutorialsSeen: Object.fromEntries(
      GAMES.map((game) => [game.id, true])
    ) as Partial<Record<GameId, true>>,
  })
