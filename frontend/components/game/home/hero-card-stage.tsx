"use client"

import { useEffect, useRef, useState } from "react"

import { SuitIcon } from "@/components/game/cards/card-face"
import { GAME_IDENTITY } from "@/components/game/game-identity"
import { gameInfo } from "@/lib/game/domain/catalog"
import { rankOf, suitOf } from "@/lib/game/domain/cards"
import type { GameId } from "@/lib/game/domain/types"
import { useReducedMotionPreference } from "@/lib/game/infrastructure/visual-preferences"
import type { CardArt } from "@/lib/three/card-art"
import type { HeroCardScene } from "@/lib/three/hero-card-scene"
import { cn } from "@/lib/utils"

const artOf = (gameId: GameId): CardArt => {
  const [card] = gameInfo(gameId).sample
  return {
    rank: card ? rankOf(card) : "A",
    suit: card ? suitOf(card) : "S",
    label: GAME_IDENTITY[gameId].short,
  }
}

const canRender3d = (): boolean => {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection
  if (connection?.saveData) return false
  if ((navigator.hardwareConcurrency ?? 4) <= 2) return false
  const probe = document.createElement("canvas")
  return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"))
}

function PosterCard({ art, hidden }: { art: CardArt; hidden: boolean }) {
  const red = art.suit === "H" || art.suit === "D"
  return (
    <div
      aria-hidden
      className={cn(
        "playing-card absolute top-1/2 left-1/2 aspect-[5/7] w-[min(58%,15rem)] -translate-x-1/2 -translate-y-1/2 -rotate-3 rounded-2xl ring-[3px] ring-gold-deep/70 transition-opacity duration-500",
        red ? "text-suit-red" : "text-suit-black",
        hidden && "opacity-0"
      )}
    >
      <span className="absolute inset-2 rounded-xl border border-current opacity-15" />
      <span className="absolute top-3 left-3.5 flex flex-col items-center gap-0.5">
        <span className="font-heading text-3xl leading-none font-semibold">
          {art.rank}
        </span>
        <SuitIcon suit={art.suit} className="size-4" />
      </span>
      <span className="absolute right-3.5 bottom-3 flex rotate-180 flex-col items-center gap-0.5">
        <span className="font-heading text-3xl leading-none font-semibold">
          {art.rank}
        </span>
        <SuitIcon suit={art.suit} className="size-4" />
      </span>
      <SuitIcon
        suit={art.suit}
        className="absolute top-[46%] left-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2"
      />
      <span className="absolute inset-x-0 bottom-[17%] text-center font-heading text-lg text-suit-black/80 italic">
        {art.label}
      </span>
    </div>
  )
}

export function HeroCardStage({
  gameId,
  className,
}: {
  gameId: GameId
  className?: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<HeroCardScene | null>(null)
  const shownGame = useRef<GameId>(gameId)
  const latestGame = useRef<GameId>(gameId)
  const [ready, setReady] = useState(false)
  const reducedMotion = useReducedMotionPreference()

  useEffect(() => {
    latestGame.current = gameId
    if (!scene.current || shownGame.current === gameId) return
    shownGame.current = gameId
    scene.current.show(artOf(gameId))
  }, [gameId])

  useEffect(() => {
    const target = canvas.current
    if (!target || !canRender3d()) return
    let cancelled = false
    const fontFamily = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-heading")
      .trim()

    Promise.all([
      import("@/lib/three/hero-card-scene"),
      document.fonts.load(`600 120px ${fontFamily}`),
      document.fonts.load(`italic 500 60px ${fontFamily}`),
    ])
      .then(([{ createHeroCardScene }]) => {
        if (cancelled) return
        shownGame.current = latestGame.current
        scene.current = createHeroCardScene({
          canvas: target,
          art: artOf(latestGame.current),
          fontFamily,
          reducedMotion,
        })
        setReady(true)
      })
      .catch(() => setReady(false))

    return () => {
      cancelled = true
      scene.current?.dispose()
      scene.current = null
      setReady(false)
    }
  }, [reducedMotion])

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return
    const box = event.currentTarget.getBoundingClientRect()
    scene.current?.point(
      ((event.clientX - box.left) / box.width - 0.5) * 2,
      ((event.clientY - box.top) / box.height - 0.5) * 2
    )
  }

  return (
    <div
      onPointerMove={track}
      onPointerLeave={() => scene.current?.point(0, 0)}
      className={cn("relative aspect-[4/5] w-full", className)}
    >
      <PosterCard art={artOf(gameId)} hidden={ready} />
      <canvas
        ref={canvas}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )
}
