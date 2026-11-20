"use client"

import { useId, useSyncExternalStore } from "react"
import {
  BookOpenCheck,
  Eye,
  Maximize2,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react"

import { Switch } from "@/components/ui/switch"
import {
  loadPlayerPreferences,
  subscribeToPreferences,
  updatePlayerPreferences,
  type PlayerPreferences,
  type PreferencesPatch,
} from "@/lib/game/infrastructure/player-preferences"

interface PreferenceOption {
  readonly icon: LucideIcon
  readonly label: string
  readonly description: string
  readonly isOn: (preferences: PlayerPreferences) => boolean
  readonly toggle: (on: boolean) => PreferencesPatch
}

const OPTIONS: readonly PreferenceOption[] = [
  {
    icon: Volume2,
    label: "Sons",
    description: "Avisa quando é sua vez e quando a partida acaba.",
    isOn: (preferences) => preferences.soundsEnabled,
    toggle: (on) => ({ soundsEnabled: on }),
  },
  {
    icon: Sparkles,
    label: "Animações reduzidas",
    description: "Menos movimento na mesa e nas cartas.",
    isOn: (preferences) => preferences.reducedMotion,
    toggle: (on) => ({ reducedMotion: on }),
  },
  {
    icon: Maximize2,
    label: "Cartas grandes",
    description: "Facilita a leitura em telas pequenas.",
    isOn: (preferences) => preferences.cardSize === "large",
    toggle: (on) => ({ cardSize: on ? "large" : "normal" }),
  },
  {
    icon: BookOpenCheck,
    label: "Tutorial automático",
    description: "Mostra as regras na primeira partida de cada jogo.",
    isOn: (preferences) => preferences.tutorialAutoOpen,
    toggle: (on) => ({ tutorialAutoOpen: on }),
  },
  {
    icon: Eye,
    label: "Código da sala visível",
    description: "Exibe o código sem precisar tocar para revelar.",
    isOn: (preferences) => preferences.showRoomCodeByDefault,
    toggle: (on) => ({ showRoomCodeByDefault: on }),
  },
]

let cachedPreferences: PlayerPreferences | null = null

const snapshot = (): PlayerPreferences => {
  const next = loadPlayerPreferences()
  if (
    cachedPreferences &&
    JSON.stringify(cachedPreferences) === JSON.stringify(next)
  ) {
    return cachedPreferences
  }
  cachedPreferences = next
  return next
}

const serverSnapshot = (): PlayerPreferences | null => null

function PreferenceRow({
  option,
  preferences,
}: {
  option: PreferenceOption
  preferences: PlayerPreferences
}) {
  const id = useId()
  const { icon: Icon } = option
  const on = option.isOn(preferences)
  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/40 has-[button:focus-visible]:bg-muted/60">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors data-[on=true]:bg-gold/20 data-[on=true]:text-foreground"
        data-on={on}
      >
        <Icon className="size-4" />
      </span>
      <label
        htmlFor={id}
        className="flex min-w-0 flex-1 cursor-pointer flex-col"
      >
        <span className="text-sm font-medium">{option.label}</span>
        <span id={`${id}-descricao`} className="text-xs text-muted-foreground">
          {option.description}
        </span>
      </label>
      <Switch
        id={id}
        checked={on}
        aria-describedby={`${id}-descricao`}
        onCheckedChange={(checked) =>
          updatePlayerPreferences(option.toggle(checked))
        }
      />
    </li>
  )
}

export function PreferencesPanel() {
  const preferences = useSyncExternalStore(
    subscribeToPreferences,
    snapshot,
    serverSnapshot
  )
  if (!preferences) return null
  return (
    <section
      aria-labelledby="titulo-preferencias"
      className="flex flex-col gap-1"
    >
      <h3
        id="titulo-preferencias"
        className="font-heading text-sm font-semibold"
      >
        Preferências
      </h3>
      <p className="text-xs text-muted-foreground">
        Ficam salvas neste aparelho.
      </p>
      <ul className="-mx-2 flex flex-col">
        {OPTIONS.map((option) => (
          <PreferenceRow
            key={option.label}
            option={option}
            preferences={preferences}
          />
        ))}
      </ul>
    </section>
  )
}
