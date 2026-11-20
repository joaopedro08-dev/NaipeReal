"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, m } from "framer-motion"
import { UserRoundX, WifiOff } from "lucide-react"

import { GameButton } from "@/components/game/game-button"
import { useGame } from "@/hooks/use-game"
import type { ConnectionStatus } from "@/lib/game/application/game-session"
import type { RoomPlayer } from "@/lib/game/domain/types"
import { gameSession } from "@/lib/game/session"
import { cn } from "@/lib/utils"

export const connectionMessage = (
  connection: ConnectionStatus,
  restoring: boolean
): string | null => {
  if (connection === "replaced") {
    return "Esta sala foi aberta em outra aba ou aparelho."
  }
  if (restoring) return "Reconectando..."
  if (connection === "online") return null
  return "Sem conexão. Tentando voltar para a sala..."
}

export const awayMessage = (nicknames: readonly string[]): string | null => {
  if (nicknames.length === 0) return null
  if (nicknames.length === 1) return `${nicknames[0]} caiu da mesa.`
  const last = nicknames.at(-1)
  return `${nicknames.slice(0, -1).join(", ")} e ${last} caíram da mesa.`
}

export const secondsUntil = (deadline: number | null, now: number) =>
  deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000))

const nearestDeadline = (players: readonly RoomPlayer[]): number | null => {
  const deadlines = players
    .map((player) => player.reconnectDeadlineAt ?? null)
    .filter((deadline): deadline is number => deadline !== null)
  return deadlines.length > 0 ? Math.min(...deadlines) : null
}

const useNow = (active: boolean): number => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active])
  return now
}

export function ConnectionBanner() {
  const { connection, restoring, room } = useGame()
  const away = room?.players.filter((player) => !player.connected) ?? []
  const now = useNow(away.length > 0)
  const ownProblem = connectionMessage(connection, restoring)
  const othersAway = awayMessage(away.map((player) => player.nickname))
  const seconds = secondsUntil(nearestDeadline(away), now)
  const replaced = connection === "replaced"
  const visible = ownProblem !== null || othersAway !== null
  const Icon = ownProblem ? WifiOff : UserRoundX

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          className={cn(
            "pointer-events-none fixed inset-x-0 top-0 z-40 flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-1.5 text-sm font-medium shadow-lg sm:px-4",
            ownProblem
              ? "bg-refusal text-refusal-foreground"
              : "bg-felt-deep/95 text-felt-foreground ring-1 ring-gold/40 backdrop-blur"
          )}
        >
          <Icon aria-hidden className="size-4 shrink-0" />
          <span
            role="status"
            className="max-w-full min-w-0 text-center break-words"
          >
            {ownProblem ?? othersAway}
            {ownProblem && othersAway && ` ${othersAway}`}
          </span>
          {seconds !== null && (
            <span
              aria-hidden
              className="rounded-full bg-black/20 px-2 py-0.5 font-mono text-xs tabular-nums"
            >
              {seconds > 0 ? `sai em ${seconds}s` : "saindo..."}
            </span>
          )}
          {replaced && (
            <GameButton
              tone="gold"
              onClick={gameSession.resumeHere}
              className="pointer-events-auto shrink-0"
            >
              Usar aqui
            </GameButton>
          )}
        </m.div>
      )}
    </AnimatePresence>
  )
}
