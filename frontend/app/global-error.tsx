"use client"

import "./globals.css"

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="bg-felt text-felt-foreground antialiased">
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <span aria-hidden className="text-5xl tracking-widest text-gold">
            ♠♥♦♣
          </span>
          <h1 className="text-3xl font-semibold">A tela não carregou</h1>
          <p className="max-w-md text-felt-muted">
            O jogo não carregou. Se você estava em uma partida, seu lugar
            continua guardado por 2 minutos.
          </p>
          <button
            type="button"
            onClick={retry}
            className="h-11 rounded-lg bg-gold px-5 text-sm font-semibold text-felt-deep shadow-lg transition-transform outline-none hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-felt"
          >
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  )
}
