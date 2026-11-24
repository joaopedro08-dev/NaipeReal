"use client"

import { useCallback, useSyncExternalStore } from "react"
import { m } from "framer-motion"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const URGENT_SECONDS = 10
const TICK_MS = 250

const subscribeToClock = (listener: () => void): (() => void) => {
  const interval = window.setInterval(listener, TICK_MS)
  return () => window.clearInterval(interval)
}

const noSeconds = (): null => null

export const useSecondsLeft = (
  deadlineAt: number | null,
  pausedAt: number | null = null
): number | null => {
  const readSeconds = useCallback(
    () =>
      deadlineAt === null
        ? null
        : Math.max(
            0,
            Math.ceil((deadlineAt - (pausedAt ?? Date.now())) / 1000)
          ),
    [deadlineAt, pausedAt]
  )
  return useSyncExternalStore(subscribeToClock, readSeconds, noSeconds)
}

export const useWaiting = (until: number | null): boolean => {
  const readWaiting = useCallback(
    () => until !== null && until > Date.now(),
    [until]
  )
  return useSyncExternalStore(subscribeToClock, readWaiting, noWaiting)
}

const noWaiting = (): boolean => false

export function TurnClock({
  deadlineAt,
  pausedAt,
  durationMs,
}: {
  deadlineAt: number | null
  pausedAt?: number | null
  durationMs?: number
}) {
  const left = useSecondsLeft(deadlineAt, pausedAt)
  if (left === null) return null
  const seconds =
    durationMs === undefined ? left : Math.min(left, durationMs / 1000)
  const urgent = seconds <= URGENT_SECONDS
  const sweep =
    durationMs === undefined
      ? 100
      : Math.max(0, Math.min(100, ((seconds * 1000) / durationMs) * 100))

  return (
    <m.span
      role="timer"
      aria-label={`${seconds} segundos restantes`}
      animate={urgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={urgent ? { duration: 1, repeat: Infinity } : undefined}
      style={
        {
          "--timer-sweep": `${sweep}%`,
          "--timer-color": urgent ? "var(--suit-red)" : "var(--gold)",
        } as React.CSSProperties
      }
      className="timer-ring relative grid size-10 shrink-0 place-items-center rounded-full"
    >
      <span
        className={cn(
          "grid size-[2.05rem] place-items-center rounded-full bg-felt-abyss font-mono text-[0.8rem] font-semibold tabular-nums",
          urgent ? "text-felt-foreground" : "text-gold"
        )}
      >
        {seconds}
      </span>
    </m.span>
  )
}

export function TurnProgress({
  deadlineAt,
  pausedAt,
  durationMs,
}: {
  deadlineAt: number | null
  pausedAt?: number | null
  durationMs: number
}) {
  const seconds = useSecondsLeft(deadlineAt, pausedAt)
  if (seconds === null) return null
  return (
    <Progress
      aria-hidden
      value={Math.min(100, ((seconds * 1000) / durationMs) * 100)}
      className="h-0.5 shrink-0 rounded-none bg-transparent [&>[data-slot=progress-indicator]]:bg-gold [&>[data-slot=progress-indicator]]:transition-transform [&>[data-slot=progress-indicator]]:duration-300 [&>[data-slot=progress-indicator]]:ease-linear"
    />
  )
}
