import Link from "next/link"

import { GameButton } from "@/components/game/game-button"
import { StatusPage } from "@/components/game/status/status-page"

export default function NotFound() {
  return (
    <StatusPage
      title="Essa carta não está no baralho"
      action={
        <GameButton asChild tone="gold" className="h-12 px-6 text-base">
          <Link href="/">Voltar ao início</Link>
        </GameButton>
      }
    >
      O endereço não existe. Volte ao início para criar uma sala ou entrar com
      um código.
    </StatusPage>
  )
}
