"use client"

import { AnimatePresence, m } from "framer-motion"

import { PlayerAvatar } from "@/components/game/room/player-avatar"
import { TurnClock, TurnProgress } from "@/components/game/table/turn-timer"
import type { PlayerId, RoomState } from "@/lib/game/domain/types"
import { cn } from "@/lib/utils"

export function MatchHeader({
  room,
  actorId,
  actorName,
  title,
  highlight,
  lastEvent,
  menu,
}: {
  room: RoomState
  actorId: PlayerId
  actorName: string
  title: string
  highlight: boolean
  lastEvent: string | undefined
  menu: React.ReactNode
}) {
  return (
    <header className="hairline relative z-10 shrink-0 border-b bg-felt-abyss/95 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2.5 px-3">
        <span
          className={cn(
            "rounded-full ring-2 ring-offset-2 ring-offset-felt-abyss transition-shadow duration-300",
            highlight ? "ring-gold" : "ring-transparent"
          )}
        >
          <PlayerAvatar playerId={actorId} nickname={actorName} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            aria-live="polite"
            className={cn(
              "truncate font-heading text-[1.05rem] leading-tight font-semibold transition-colors",
              highlight && "text-gold"
            )}
          >
            {title}
          </p>
          <div className="relative h-4 overflow-hidden">
            <AnimatePresence initial={false}>
              <m.p
                key={lastEvent ?? "inicio"}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 truncate text-xs text-felt-muted"
              >
                {lastEvent ?? "A partida começou"}
              </m.p>
            </AnimatePresence>
          </div>
        </div>
        <TurnClock
          deadlineAt={room.turnDeadlineAt}
          pausedAt={room.pausedAt}
          durationMs={room.turnDurationMs}
        />
        {menu}
      </div>
      <TurnProgress
        deadlineAt={room.turnDeadlineAt}
        pausedAt={room.pausedAt}
        durationMs={room.turnDurationMs}
      />
    </header>
  )
}
