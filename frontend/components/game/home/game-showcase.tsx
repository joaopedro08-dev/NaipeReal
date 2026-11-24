"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Play } from "lucide-react"

import { SuitIcon } from "@/components/game/cards/card-face"
import { GAME_IDENTITY } from "@/components/game/game-identity"
import { GameButton } from "@/components/game/game-button"
import { GamePreview } from "@/components/game/home/game-previews"
import { SectionIntro } from "@/components/game/home/section-intro"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DEFAULT_GAME_ID,
  describePlayerCounts,
  GAMES,
} from "@/lib/game/domain/catalog"
import type { GameInfo } from "@/lib/game/domain/catalog"
import type { GameId } from "@/lib/game/domain/types"

function GameFacts({ game }: { game: GameInfo }) {
  const facts = [
    { label: "Jogadores", value: describePlayerCounts(game) },
    { label: "Formato", value: game.mode },
    { label: "Baralho", value: game.deck },
    { label: "Tempo da vez", value: `${game.turnSeconds} s, ajustável` },
  ]
  return (
    <dl className="hairline grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4">
      {facts.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-felt-muted">{label}</dt>
          <dd className="text-sm font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function GameStage({
  game,
  onPick,
}: {
  game: GameInfo
  onPick: (gameId: GameId) => void
}) {
  const { short, suit } = GAME_IDENTITY[game.id]
  return (
    <div className="grid animate-in gap-6 duration-300 ease-deal fade-in slide-in-from-bottom-2">
      <GamePreview gameId={game.id} />
      <div className="flex flex-col gap-5">
        <p className="max-w-xl font-heading text-2xl/snug [font-variation-settings:'SOFT'_50]">
          {game.tagline}
        </p>
        <ul className="flex flex-col gap-2 text-[0.95rem]/relaxed text-felt-muted">
          {game.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5">
              <SuitIcon
                suit={suit}
                className="mt-1.5 size-3 shrink-0 text-gold"
              />
              {highlight}
            </li>
          ))}
        </ul>
        <GameFacts game={game} />
        <div className="flex flex-wrap gap-2">
          <GameButton
            tone="gold"
            onClick={() => onPick(game.id)}
            className="h-12 flex-1 text-base sm:flex-none sm:px-6"
          >
            <Play aria-hidden />
            Criar sala de {short}
          </GameButton>
          <GameButton asChild className="h-12">
            <Link href={`/informacoes#${game.rulesAnchor}`}>
              <BookOpen aria-hidden />
              Ler as regras
            </Link>
          </GameButton>
        </div>
      </div>
    </div>
  )
}

export function GameShowcase({ onPick }: { onPick: (gameId: GameId) => void }) {
  const [active, setActive] = useState<GameId>(DEFAULT_GAME_ID)

  return (
    <section
      id="jogos"
      aria-labelledby="jogos-titulo"
      className="flex scroll-mt-20 flex-col gap-8"
    >
      <SectionIntro id="jogos-titulo" title="Seis jogos, um link só">
        Toque num jogo para ver uma rodada de mentira. Quem cria a sala escolhe
        o jogo e pode trocar enquanto a turma espera no saguão.
      </SectionIntro>

      <Tabs
        value={active}
        onValueChange={(value) => setActive(value as GameId)}
        orientation="vertical"
        className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12"
      >
        <TabsList
          aria-label="Jogos disponíveis"
          className="-mx-4 flex h-auto snap-x snap-mandatory [scrollbar-width:none] gap-1 overflow-x-auto bg-transparent px-4 py-1 group-data-vertical/tabs:h-auto lg:mx-0 lg:flex-col lg:items-stretch lg:overflow-visible lg:px-0"
        >
          {GAMES.map((game) => {
            const { suit } = GAME_IDENTITY[game.id]
            return (
              <TabsTrigger
                key={game.id}
                value={game.id}
                className="group/row relative h-auto min-h-12 w-auto shrink-0 snap-start justify-start gap-3 rounded-xl border-0 px-3 py-2 text-left whitespace-nowrap text-felt-muted ring-1 ring-felt-line/50 transition-colors duration-200 hover:text-felt-foreground lg:min-h-0 lg:w-full lg:rounded-none lg:border-b lg:border-felt-line/40 lg:bg-transparent lg:px-1 lg:py-4 lg:ring-0 dark:text-felt-muted data-active:bg-playing-card data-active:text-suit-black data-active:shadow-card data-active:ring-transparent lg:data-active:bg-transparent lg:data-active:text-felt-foreground lg:data-active:shadow-none dark:data-active:bg-playing-card dark:data-active:text-suit-black lg:dark:data-active:bg-transparent lg:dark:data-active:text-felt-foreground"
              >
                <span
                  aria-hidden
                  className="playing-card flex h-8 w-6 shrink-0 items-center justify-center rounded-[0.3rem] ring-1 ring-black/15 transition-transform duration-300 ease-snap group-data-active/row:-rotate-8 lg:h-11 lg:w-8"
                >
                  <SuitIcon suit={suit} className="size-3.5 lg:size-4" />
                </span>
                <span className="font-heading text-base font-semibold lg:text-[2rem] lg:leading-none lg:font-medium">
                  {game.name}
                </span>
                <span className="ml-auto hidden pl-3 text-sm font-medium lg:block">
                  {describePlayerCounts(game)}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-y-3 -left-3 hidden w-1 origin-center scale-y-0 rounded-full bg-gold transition-transform duration-300 ease-deal group-data-active/row:scale-y-100 lg:block"
                />
              </TabsTrigger>
            )
          })}
        </TabsList>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {GAMES.map((game) => (
            <TabsContent key={game.id} value={game.id}>
              <GameStage game={game} onPick={onPick} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </section>
  )
}
