"use client"

import { GameMenu } from "@/components/game/table/game-menu"
import { MatchHeader } from "@/components/game/table/match-header"
import type { GameState, Hints, RoomState } from "@/lib/game/domain/types"

export function GameHeader({
  room,
  game,
  isMyTurn,
  currentName,
  hints,
  hintsEnabled,
  onHintsChange,
}: {
  room: RoomState
  game: GameState
  isMyTurn: boolean
  currentName: string
  hints: Hints | null
  hintsEnabled: boolean
  onHintsChange: (enabled: boolean) => void
}) {
  return (
    <MatchHeader
      room={room}
      actorId={game.currentPlayerId}
      actorName={currentName}
      title={isMyTurn ? "Sua vez" : `Vez de ${currentName}`}
      highlight={isMyTurn}
      lastEvent={game.history[0]}
      menu={
        <GameMenu
          room={room}
          game={game}
          hints={hints}
          hintsEnabled={hintsEnabled}
          onHintsChange={onHintsChange}
        />
      }
    />
  )
}
