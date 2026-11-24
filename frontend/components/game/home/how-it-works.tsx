"use client"

import { useRef } from "react"
import { Check } from "lucide-react"

import { CardBack } from "@/components/game/cards/card-face"
import { SectionIntro } from "@/components/game/home/section-intro"
import { gsap, MOTION_OK, useGSAP } from "@/lib/animation/landing-gsap"

const SAMPLE_CODE = "K7Q2MX"

function CodeArt() {
  return (
    <div className="flex justify-center gap-1 [perspective:600px]">
      {[...SAMPLE_CODE].map((letter, index) => (
        <span
          key={index}
          data-piece="flip"
          className="playing-card flex h-11 w-8 items-center justify-center rounded-md font-mono text-xl font-bold text-suit-black"
        >
          {letter}
        </span>
      ))}
    </div>
  )
}

function ShareArt() {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <p
        data-piece="pop"
        className="max-w-[15rem] origin-bottom-right rounded-2xl rounded-br-sm bg-emerald-100 px-3 py-2 text-left text-sm text-emerald-950 shadow-card"
      >
        Bora jogar? Entra aí:{" "}
        <span className="font-semibold underline">…/?sala={SAMPLE_CODE}</span>
      </p>
      <span
        data-piece="pop"
        className="flex items-center gap-1 text-xs font-medium text-felt-muted"
      >
        <Check aria-hidden className="size-3.5 text-gold" />
        Link copiado
      </span>
    </div>
  )
}

const SEATS = ["bg-amber-200", "bg-sky-200", "bg-rose-200"] as const

function DealArt() {
  return (
    <div className="flex justify-center gap-5">
      {SEATS.map((tone) => (
        <div key={tone} className="flex flex-col items-center gap-1.5">
          <div className="flex -space-x-4">
            {[-10, 0, 10].map((tilt) => (
              <div
                key={tilt}
                data-piece="deal"
                style={{ rotate: `${tilt}deg` }}
              >
                <CardBack className="h-11 w-8" />
              </div>
            ))}
          </div>
          <span
            className={`size-7 rounded-full ${tone} ring-2 ring-felt-deep`}
          />
        </div>
      ))}
    </div>
  )
}

const STEPS = [
  {
    title: "Crie a sala",
    text: "Escolha um apelido e o jogo. A sala nasce com um código de 6 letras e números.",
    art: CodeArt,
  },
  {
    title: "Mande no grupo",
    text: "Quem abrir o link já cai na sala, com o código preenchido. Só falta o apelido.",
    art: ShareArt,
  },
  {
    title: "Dê as cartas",
    text: "Com todo mundo sentado, quem criou a sala começa a partida. No Truco, dá para montar os times ou sortear.",
    art: DealArt,
  },
] as const

export function HowItWorks() {
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(MOTION_OK, () => {
        const list = section.current?.querySelector("ol")
        gsap.fromTo(
          "[data-rail]",
          { scale: 0 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: list,
              start: "top 78%",
              end: "bottom 62%",
              scrub: 0.6,
            },
          }
        )
        for (const step of gsap.utils.toArray<HTMLElement>("[data-step]")) {
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: step, start: "top 82%", once: true },
          })
          timeline
            .from(step.querySelectorAll("[data-piece='flip']"), {
              rotateX: -90,
              opacity: 0,
              duration: 0.5,
              ease: "back.out(1.6)",
              stagger: 0.07,
            })
            .from(
              step.querySelectorAll("[data-piece='pop']"),
              {
                scale: 0.85,
                y: 10,
                opacity: 0,
                duration: 0.45,
                ease: "back.out(1.8)",
                stagger: 0.25,
              },
              0
            )
            .from(
              step.querySelectorAll("[data-piece='deal']"),
              {
                y: -36,
                rotate: -28,
                opacity: 0,
                duration: 0.45,
                ease: "power3.out",
                stagger: { each: 0.06, grid: [3, 3], axis: "x" },
              },
              0
            )
        }
      })
      return () => media.revert()
    },
    { scope: section }
  )

  return (
    <section
      ref={section}
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className="flex scroll-mt-20 flex-col gap-10"
    >
      <SectionIntro
        id="como-funciona-titulo"
        title="Do convite à primeira carta"
      >
        Três passos, e o primeiro leva menos tempo que embaralhar.
      </SectionIntro>

      <div className="relative">
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-5 w-px bg-felt-line/50 md:top-5 md:right-[16%] md:bottom-auto md:left-[16%] md:h-px md:w-auto"
        >
          <div data-rail className="size-full origin-top bg-gold md:hidden" />
          <div
            data-rail
            className="hidden size-full origin-left bg-gold md:block"
          />
        </div>
        <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ title, text, art: Art }, index) => (
            <li
              key={title}
              data-step
              className="relative flex gap-4 md:flex-col md:items-center md:text-center"
            >
              <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-gold font-heading text-lg font-semibold text-gold-foreground shadow-lift ring-4 ring-felt">
                {index + 1}
              </span>
              <div className="flex flex-1 flex-col gap-4 md:w-full">
                <div className="felt-table flex min-h-28 items-center justify-center rounded-2xl p-4 ring-1 ring-felt-line/60">
                  <Art />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-2xl font-semibold">
                    {title}
                  </h3>
                  <p className="text-[0.95rem]/relaxed text-felt-muted">
                    {text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
