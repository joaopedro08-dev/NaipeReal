"use client"

import dynamic from "next/dynamic"
import { LazyMotion, MotionConfig } from "framer-motion"

import { EntryPanel } from "@/components/game/home/entry-panel"
import { Faq } from "@/components/game/home/faq"
import { Features } from "@/components/game/home/features"
import { HomeHero } from "@/components/game/home/home-hero"
import { ENTRY_ANCHOR, useEntry } from "@/components/game/home/use-entry"
import { SiteFooter } from "@/components/game/site-footer"
import { SiteHeader } from "@/components/game/site-header"
import type { HeaderLink } from "@/components/game/site-header"
import { useReducedMotionPreference } from "@/lib/game/infrastructure/visual-preferences"

const loadMotionFeatures = () =>
  import("@/lib/animation/motion-features").then((mod) => mod.default)

const GameShowcase = dynamic(() =>
  import("@/components/game/home/game-showcase").then((mod) => mod.GameShowcase)
)

const HowItWorks = dynamic(() =>
  import("@/components/game/home/how-it-works").then((mod) => mod.HowItWorks)
)

const ClosingCall = dynamic(() =>
  import("@/components/game/home/closing-call").then((mod) => mod.ClosingCall)
)

const HEADER_LINKS: readonly HeaderLink[] = [
  { href: "#jogos", label: "Jogos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#duvidas", label: "Dúvidas" },
  { href: "/informacoes", label: "Regras" },
]

const HEADER_CTA: HeaderLink = {
  href: `#${ENTRY_ANCHOR}`,
  label: "Jogar agora",
}

export function HomeScreen() {
  const [entry, nicknameInput] = useEntry()
  const reducedMotion = useReducedMotionPreference()

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        <div className="flex min-h-svh flex-col overflow-x-clip">
          <SiteHeader links={HEADER_LINKS} cta={HEADER_CTA} />
          <main className="flex-1">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pt-8 pb-12 sm:gap-32 sm:pt-12">
              <HomeHero
                gameId={entry.gameId}
                invited={entry.invited}
                onChoose={entry.chooseGame}
                panel={
                  <EntryPanel entry={entry} nicknameInput={nicknameInput} />
                }
              />
              <GameShowcase onPick={entry.pickGame} />
              <HowItWorks />
              <Features />
              <Faq />
              <ClosingCall
                onCreate={() => entry.openEntry("criar")}
                onJoin={() => entry.openEntry("entrar")}
              />
            </div>
          </main>
          <SiteFooter />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
