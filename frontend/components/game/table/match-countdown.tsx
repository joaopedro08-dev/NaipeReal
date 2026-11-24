"use client"

import { m } from "framer-motion"

export function MatchCountdown({ seconds }: { seconds: number }) {
  return (
    <div
      role="status"
      data-countdown
      className="felt-surface fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 text-center"
    >
      <p className="font-heading text-2xl font-medium text-felt-muted">
        Embaralhando. A partida começa em
      </p>
      <m.span
        key={seconds}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="font-heading text-[9rem] leading-none font-semibold text-gold tabular-nums [font-variation-settings:'SOFT'_100]"
      >
        {seconds}
      </m.span>
    </div>
  )
}
