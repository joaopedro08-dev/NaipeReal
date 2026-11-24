"use client"

import { m } from "framer-motion"
import { RotateCcw, Trophy } from "lucide-react"

import { GameButton } from "@/components/game/game-button"
import { GamePicker } from "@/components/game/game-picker"
import { RefusalMessage } from "@/components/game/refusal-message"
import { HintsSetting } from "@/components/game/room/hints-setting"
import { InviteLink } from "@/components/game/room/invite-link"
import { LeaveRoomButton } from "@/components/game/room/leave-button"
import { useRoomCommands } from "@/components/game/room/use-room-commands"
import { useVictoryShow } from "@/components/game/room/use-victory-show"
import { Card, CardContent } from "@/components/ui/card"
import { describeStartProblem } from "@/lib/game/domain/catalog"
import type { RoomState } from "@/lib/game/domain/types"
import { useGame } from "@/hooks/use-game"
import { cn } from "@/lib/utils"

type RoomCommands = ReturnType<typeof useRoomCommands>

export function MatchEnd({
  won,
  title,
  subtitle,
  children,
}: {
  won: boolean
  title: string
  subtitle: string | null
  children: React.ReactNode
}) {
  const { stage, title: titleRef } = useVictoryShow(won)
  const { room } = useGame()
  const roomWins = room
    ? room.players
        .map((player) => ({
          ...player,
          wins: room.matchWins?.[player.id] ?? 0,
        }))
        .filter((player) => player.wins > 0)
        .sort((first, second) => second.wins - first.wins)
    : []
  return (
    <div ref={stage} className="relative overflow-hidden">
      <main className="relative mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-6 px-4 py-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <m.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 12 }}
            className={cn(
              "grid size-20 place-items-center rounded-full ring-1",
              won
                ? "bg-gold text-gold-foreground shadow-[0_0_48px_-6px_var(--gold)] ring-gold"
                : "bg-felt-deep text-gold ring-gold/40"
            )}
          >
            <Trophy aria-hidden className="size-9" />
          </m.span>
          <h1
            ref={titleRef}
            className="font-heading text-[clamp(2rem,7vw,2.75rem)] leading-[1.05] font-semibold [font-variation-settings:'SOFT'_50]"
          >
            {title}
          </h1>
          {subtitle && <p className="max-w-sm text-felt-muted">{subtitle}</p>}
        </header>

        <Card className="shadow-lift">
          <CardContent className="flex flex-col gap-4">
            {roomWins.length > 0 && (
              <section aria-labelledby="placar-sala">
                <h2
                  id="placar-sala"
                  className="font-heading text-xl font-semibold"
                >
                  Placar da sala
                </h2>
                <ol className="divide-y divide-border/60">
                  {roomWins.map((player) => {
                    const isViewer = player.id === room?.viewerId
                    return (
                      <li
                        key={player.id}
                        className={cn(
                          "flex items-center justify-between py-2 text-sm",
                          isViewer && "font-semibold"
                        )}
                      >
                        <span className="truncate">
                          {player.nickname}
                          {isViewer && " (você)"}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {player.wins}{" "}
                          {player.wins === 1 ? "vitória" : "vitórias"}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export function RematchControls({
  room,
  inviteUrl,
  commands,
  roster,
}: {
  room: RoomState
  inviteUrl: string | null
  commands: RoomCommands
  roster?: React.ReactNode
}) {
  const { refusal, busy, startMatch } = commands
  const viewerIsHost = room.hostId === room.viewerId
  const host = room.players.find((player) => player.id === room.hostId)
  const problem = describeStartProblem(room)

  return (
    <>
      {viewerIsHost && (
        <GamePicker
          value={room.gameId}
          onChange={commands.chooseGame}
          disabled={busy}
          label="Jogo da próxima partida"
        />
      )}

      <HintsSetting
        allowed={room.hintsAllowed}
        editable={viewerIsHost}
        busy={busy}
        onChange={commands.allowHints}
      />

      {roster}

      {room.startProblem === "NOT_ENOUGH_PLAYERS" && inviteUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Chame alguém para jogar de novo</p>
          <InviteLink url={inviteUrl} />
        </div>
      )}

      {refusal && <RefusalMessage>{refusal}</RefusalMessage>}

      {viewerIsHost ? (
        <div className="flex flex-col gap-2">
          <GameButton
            tone="gold"
            disabled={!room.canStart || busy}
            onClick={startMatch}
            className="w-full"
          >
            <RotateCcw aria-hidden />
            Jogar de novo
          </GameButton>
          {problem && (
            <p className="text-center text-sm text-muted-foreground">
              {problem}
            </p>
          )}
        </div>
      ) : (
        <p role="status" className="text-center text-sm text-muted-foreground">
          Aguardando {host?.nickname ?? "o anfitrião"} começar outra partida.
        </p>
      )}

      <LeaveRoomButton className="w-full" />
    </>
  )
}
