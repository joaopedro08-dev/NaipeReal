"use client"

import { useRef } from "react"
import { Timer } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const TURN_DURATIONS = [15, 30, 60] as const

export type TurnDuration = (typeof TURN_DURATIONS)[number]

export const effectiveTurnSeconds = (
  chosen: TurnDuration | null,
  durationMs: number
): number => chosen ?? Math.round(durationMs / 1000)

const PACE_LABEL: Readonly<Record<TurnDuration, string>> = {
  15: "Rápido",
  30: "Equilibrado",
  60: "Tranquilo",
}

export function TurnDurationSetting({
  chosen,
  durationMs,
  editable,
  busy,
  onChange,
}: {
  chosen: TurnDuration | null
  durationMs: number
  editable: boolean
  busy: boolean
  onChange: (seconds: TurnDuration) => void
}) {
  const group = useRef<HTMLDivElement>(null)
  const seconds = effectiveTurnSeconds(chosen, durationMs)

  const moveFocus = (event: React.KeyboardEvent, index: number) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0
    if (step === 0) return
    event.preventDefault()
    const next =
      TURN_DURATIONS[
        (index + step + TURN_DURATIONS.length) % TURN_DURATIONS.length
      ]
    onChange(next)
    group.current
      ?.querySelector<HTMLButtonElement>(`[data-seconds="${next}"]`)
      ?.focus()
  }

  return (
    <section aria-labelledby="titulo-tempo" className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Timer aria-hidden className="size-4 text-gold" />
        <h2 id="titulo-tempo" className="font-heading text-base font-semibold">
          Tempo da vez
        </h2>
        {editable ? (
          chosen === null && (
            <Badge variant="outline" className="ml-auto text-xs">
              Padrão do jogo
            </Badge>
          )
        ) : (
          <Badge className="ml-auto font-mono tabular-nums">{seconds}s</Badge>
        )}
      </div>
      {editable ? (
        <div
          ref={group}
          role="radiogroup"
          aria-labelledby="titulo-tempo"
          className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
        >
          {TURN_DURATIONS.map((option, index) => {
            const selected = seconds === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                data-seconds={option}
                aria-checked={selected}
                tabIndex={
                  selected ||
                  (!TURN_DURATIONS.includes(seconds as TurnDuration) &&
                    index === 0)
                    ? 0
                    : -1
                }
                disabled={busy}
                onClick={() => onChange(option)}
                onKeyDown={(event) => moveFocus(event, index)}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-lg px-2 py-1 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-60",
                  selected
                    ? "bg-background font-semibold shadow-sm ring-1 ring-gold/60"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                <span className="font-mono tabular-nums">{option}s</span>
                <span className="text-[0.7rem] leading-tight">
                  {PACE_LABEL[option]}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Cada jogador tem {seconds} segundos por vez. Quem decide é o
          anfitrião.
        </p>
      )}
    </section>
  )
}
