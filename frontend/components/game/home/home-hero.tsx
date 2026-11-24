"use client"

import { useRef } from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { SuitIcon } from "@/components/game/cards/card-face"
import { GAME_IDENTITY } from "@/components/game/game-identity"
import { HeroCardStage } from "@/components/game/home/hero-card-stage"
import { gsap, SplitText, useGSAP } from "@/lib/animation/landing-gsap"
import { describePlayerCounts, GAMES } from "@/lib/game/domain/catalog"
import type { GameId } from "@/lib/game/domain/types"
import { cn } from "@/lib/utils"

function GameDealer({
  gameId,
  onChoose,
}: {
  gameId: GameId
  onChoose: (gameId: GameId) => void
}) {
  return (
    <RadioGroupPrimitive.Root
      aria-label="Jogo da nova sala"
      value={gameId}
      onValueChange={(next) => onChoose(next as GameId)}
      orientation="horizontal"
      loop
      className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
    >
      {GAMES.map((game) => {
        const { suit, short } = GAME_IDENTITY[game.id]
        const checked = game.id === gameId
        return (
          <RadioGroupPrimitive.Item
            key={game.id}
            value={game.id}
            aria-label={`${game.name}, ${describePlayerCounts(game)}`}
            className={cn(
              "group/deal inline-flex min-h-11 items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-sm font-semibold ring-1 transition-[background-color,color,box-shadow,transform] duration-200 ease-deal outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold active:translate-y-0",
              checked
                ? "bg-gold text-gold-foreground shadow-lift ring-gold"
                : "bg-felt-deep/70 text-felt-foreground ring-felt-line/70 hover:ring-gold/60"
            )}
          >
            <span
              aria-hidden
              className="playing-card flex h-9 w-7 items-center justify-center rounded-md ring-1 ring-black/15 transition-transform duration-300 ease-snap group-data-[state=checked]/deal:-rotate-6"
            >
              <SuitIcon suit={suit} className="size-3.5" />
            </span>
            {short}
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}

function Headline({ gameId }: { gameId: GameId }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const { short } = GAME_IDENTITY[gameId]

  useGSAP(
    () => {
      const target = heading.current
      if (!target) return
      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(target.querySelectorAll("[data-line]"), {
          type: "words",
          mask: "words",
        })
        gsap.from(split.words, {
          yPercent: 110,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.1,
        })
        return () => split.revert()
      })
      return () => media.revert()
    },
    { scope: heading }
  )

  return (
    <h1
      ref={heading}
      className="font-heading text-[clamp(2.9rem,9vw,6rem)] leading-[1.02] font-semibold tracking-[-0.025em] [font-variation-settings:'SOFT'_50] short:text-5xl"
    >
      <span className="sr-only">Naipe Real: hoje tem {short} na mesa.</span>
      <span aria-hidden className="block" data-line>
        Hoje tem
      </span>
      <span aria-hidden className="relative block overflow-hidden pb-[0.08em]">
        <span
          key={gameId}
          className="block animate-in whitespace-nowrap text-gold duration-500 ease-deal fade-in slide-in-from-bottom-6"
        >
          {short}
        </span>
      </span>
      <span aria-hidden className="block" data-line>
        na mesa.
      </span>
    </h1>
  )
}

export function HomeHero({
  gameId,
  invited,
  onChoose,
  panel,
}: {
  gameId: GameId
  invited: boolean
  onChoose: (gameId: GameId) => void
  panel: React.ReactNode
}) {
  return (
    <section
      aria-label="Entrar em uma sala"
      className={cn(
        "grid grid-cols-1 items-start gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
        invited
          ? "[grid-template-areas:'panel'_'copy'_'stage'] lg:[grid-template-areas:'copy_stage'_'panel_stage']"
          : "[grid-template-areas:'copy'_'stage'_'panel'] lg:[grid-template-areas:'copy_stage'_'panel_stage']"
      )}
    >
      <div className="flex flex-col gap-5 [grid-area:copy]">
        <Headline gameId={gameId} />
        <p className="max-w-[34rem] text-lg/relaxed text-felt-muted short:hidden">
          Uma pessoa cria a sala e manda o código no grupo. Cada um joga do
          próprio celular ou do computador, sem criar conta nem instalar nada.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 [grid-area:stage] lg:sticky lg:top-24">
        <HeroCardStage
          gameId={gameId}
          className="max-h-[18rem] max-w-[18rem] sm:max-h-[26rem] sm:max-w-[26rem] lg:max-h-[min(30rem,62svh)] lg:max-w-[30rem] short:hidden"
        />
        <GameDealer gameId={gameId} onChoose={onChoose} />
      </div>

      <div className="w-full max-w-md justify-self-center [grid-area:panel] lg:justify-self-start">
        {panel}
      </div>
    </section>
  )
}
