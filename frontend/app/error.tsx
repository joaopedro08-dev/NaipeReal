"use client"

import { GameButton } from "@/components/game/game-button"
import { StatusPage } from "@/components/game/status/status-page"

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <StatusPage
      title="A tela não carregou"
      action={
        <GameButton tone="gold" onClick={retry} className="h-12 px-6 text-base">
          Tentar de novo
        </GameButton>
      }
    >
      Se você estava em uma partida, seu lugar continua guardado por 2 minutos.
    </StatusPage>
  )
}
