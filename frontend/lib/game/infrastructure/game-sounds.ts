import { loadPlayerPreferences } from "./player-preferences"

export type GameSound = "card" | "turn" | "finish"

const FREQUENCIES: Record<GameSound, number> = {
  card: 220,
  turn: 440,
  finish: 660,
}

const VOLUME = 0.08
const DURATION_SECONDS = 0.08

type AudioContextConstructor = typeof AudioContext

const contexts = new WeakMap<AudioContextConstructor, AudioContext>()

const audioConstructor = (): AudioContextConstructor | undefined =>
  window.AudioContext ??
  (window as typeof window & { webkitAudioContext?: AudioContextConstructor })
    .webkitAudioContext

const sharedContext = (): AudioContext | null => {
  const Constructor = audioConstructor()
  if (!Constructor) return null
  const existing = contexts.get(Constructor)
  if (existing && existing.state !== "closed") return existing
  const created = new Constructor()
  contexts.set(Constructor, created)
  return created
}

export const playGameSound = (sound: GameSound): void => {
  if (!loadPlayerPreferences().soundsEnabled) return
  const context = sharedContext()
  if (!context) return
  if (context.state === "suspended") void context.resume()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = FREQUENCIES[sound]
  gain.gain.setValueAtTime(VOLUME, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    context.currentTime + DURATION_SECONDS
  )
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + DURATION_SECONDS)
}
