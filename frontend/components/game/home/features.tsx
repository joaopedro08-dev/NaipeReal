import {
  EyeOff,
  Lightbulb,
  RefreshCw,
  Smartphone,
  Timer,
  Wifi,
} from "lucide-react"

import { SectionIntro } from "@/components/game/home/section-intro"

const RULES = [
  {
    icon: EyeOff,
    title: "Ninguém espia a sua mão",
    text: "O servidor confere cada jogada e manda a cada pessoa só o que ela pode ver. Nem olhando o tráfego da página dá para ver a carta do outro.",
  },
  {
    icon: Wifi,
    title: "A carta aparece na hora",
    text: "Jogou, todo mundo vê em menos de um segundo, sem atualizar a página.",
  },
  {
    icon: Timer,
    title: "Relógio em cada vez",
    text: "Quem demora não trava a mesa: quando o tempo acaba, o jogo faz uma jogada automática e segue.",
  },
  {
    icon: Lightbulb,
    title: "Dicas para quem está aprendendo",
    text: "Força das cartas no Truco, melhor captura no Rouba Monte, jogos prontos na Cacheta, estratégia básica no Blackjack. Desliga quando quiser.",
  },
  {
    icon: RefreshCw,
    title: "Se a internet cair, você volta",
    text: "Abra o site de novo no mesmo navegador em até 2 minutos e retome a sua cadeira e a sua mão.",
  },
  {
    icon: Smartphone,
    title: "Cabe numa mão só",
    text: "Botões grandes, naipe e valor legíveis sem depender da cor e a opção de cartas maiores no menu da partida.",
  },
] as const

export function Features() {
  return (
    <section
      id="recursos"
      aria-labelledby="recursos-titulo"
      className="grid scroll-mt-20 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
    >
      <SectionIntro
        id="recursos-titulo"
        title="Regras da casa"
        className="lg:sticky lg:top-24 lg:self-start"
      >
        O que vale em todas as mesas, do Rouba Monte ao Poker, para a partida
        ser justa e ninguém ficar esperando.
      </SectionIntro>

      <ul className="flex flex-col">
        {RULES.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="hairline grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-b py-5 first:pt-0 last:border-b-0"
          >
            <span className="row-span-2 flex size-11 items-center justify-center rounded-full bg-felt-deep ring-1 ring-gold/40">
              <Icon aria-hidden className="size-5 text-gold" />
            </span>
            <h3 className="font-heading text-xl font-semibold">{title}</h3>
            <p className="text-[0.95rem]/relaxed text-felt-muted">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
