import type { Metadata } from "next"
import Link from "next/link"
import {
  DoorOpen,
  Lightbulb,
  Plus,
  Radio,
  RefreshCw,
  Share2,
  ShieldCheck,
} from "lucide-react"

import { CardFace, SuitIcon } from "@/components/game/cards/card-face"
import { GAME_IDENTITY } from "@/components/game/game-identity"
import { GameButton } from "@/components/game/game-button"
import { InfoNav } from "@/components/game/info/info-nav"
import type { InfoSectionLink } from "@/components/game/info/info-nav"
import { SiteFooter } from "@/components/game/site-footer"
import { SiteHeader } from "@/components/game/site-header"
import type { HeaderLink } from "@/components/game/site-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { describePlayerCounts, GAMES } from "@/lib/game/domain/catalog"
import type { GameInfo } from "@/lib/game/domain/catalog"
import { rankOf, suitOf } from "@/lib/game/domain/cards"
import { RULE_SECTIONS } from "@/lib/game/domain/how-to-play"
import { BLACKJACK_RULE_SECTIONS } from "@/lib/game/domain/blackjack/how-to-play"
import { CACHETA_RULE_SECTIONS } from "@/lib/game/domain/cacheta/how-to-play"
import { POKER_RULE_SECTIONS } from "@/lib/game/domain/poker/how-to-play"
import { TRES_TRINCAS_RULE_SECTIONS } from "@/lib/game/domain/tres-trincas/how-to-play"
import { TRUCO_RULE_SECTIONS } from "@/lib/game/domain/truco/how-to-play"
import type { GameId } from "@/lib/game/domain/types"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Regras e informações · Naipe Real",
  description:
    "Como jogar Rouba Monte, Truco Paulista, Três Trincas, Poker, Cacheta e Blackjack, o que você precisa para começar e como o sistema funciona.",
}

type RuleItem = { readonly title: string; readonly text: string }

const RULES: Readonly<Record<GameId, readonly RuleItem[]>> = {
  "rouba-monte": RULE_SECTIONS,
  "truco-paulista": TRUCO_RULE_SECTIONS,
  "tres-trincas": TRES_TRINCAS_RULE_SECTIONS,
  "poker-texas-holdem": POKER_RULE_SECTIONS,
  cacheta: CACHETA_RULE_SECTIONS,
  blackjack: BLACKJACK_RULE_SECTIONS,
}

const HEADER_LINKS: readonly HeaderLink[] = [
  { href: "/#jogos", label: "Jogos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#duvidas", label: "Dúvidas" },
  { href: "/informacoes", label: "Regras", current: true },
]

const HEADER_CTA: HeaderLink = { href: "/#entrar", label: "Jogar agora" }

const SECTIONS: readonly InfoSectionLink[] = [
  { id: "informacoes-gerais", label: "Para começar", suit: null },
  ...GAMES.map((game) => ({
    id: game.rulesAnchor,
    label: GAME_IDENTITY[game.id].short,
    suit: GAME_IDENTITY[game.id].suit,
  })),
  { id: "sobre-o-sistema", label: "Sobre o sistema", suit: null },
]

const GENERAL_STEPS = [
  {
    icon: Plus,
    title: "Crie a sala",
    text: "Escolha um apelido e o jogo. Não há instalação nem cadastro: basta um navegador, no PC ou no celular.",
  },
  {
    icon: Share2,
    title: "Chame os amigos",
    text: "Mande o código ou o link. No Truco, quem criou a sala também forma os times ou sorteia.",
  },
  {
    icon: DoorOpen,
    title: "Comece a partida",
    text: "Antes de iniciar, o anfitrião pode sortear o jogo, escolher 15, 30 ou 60 s por vez e ligar ou desligar as dicas. Cada pessoa joga pelo próprio aparelho.",
  },
] as const

const SYSTEM_INFO = [
  {
    icon: Radio,
    title: "Partida em tempo real",
    text: "O servidor confere cada jogada e envia a cada jogador só o que ele pode ver. Ninguém vê a mão dos outros.",
  },
  {
    icon: RefreshCw,
    title: "Se a conexão cair",
    text: "Abra o jogo de novo no mesmo navegador para voltar à sua sala e à sua mão. Você tem 2 minutos. Se quem cair for o anfitrião, o próximo jogador conectado assume o comando até ele voltar.",
  },
  {
    icon: Lightbulb,
    title: "Dicas",
    text: "No Rouba Monte, o jogo destaca a melhor jogada e as outras possíveis. No Truco, mostra a força das suas cartas e sugere o que jogar ou responder. No Três Trincas, organiza a mão por valor, destaca as trincas prontas e marca as cartas mortas. No Poker, mostra o seu jogo atual e quantas cartas ainda o melhoram. Na Cacheta, junta os jogos prontos na mão, avisa quando dá para bater e sugere o descarte. No Blackjack, sugere pedir, parar, dobrar ou dividir pela estratégia básica. Você pode desligar as dicas no menu da partida, e o anfitrião pode desligá-las para a sala toda.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados",
    text: "O navegador guarda o apelido, a chave para voltar à sala e as suas preferências, só neste aparelho. As salas ficam só na memória do servidor, sem banco de dados, e se perdem quando ele reinicia.",
  },
] as const

const SECTION_SCROLL = "scroll-mt-36 lg:scroll-mt-24"

const DISPLAY =
  "font-heading font-semibold tracking-[-0.02em] [font-variation-settings:'SOFT'_50]"

function SectionHeading({
  id,
  children,
  lead,
}: {
  id: string
  children: React.ReactNode
  lead?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2
        id={id}
        className={cn(DISPLAY, "text-[clamp(2rem,4vw,2.75rem)] leading-[1.05]")}
      >
        {children}
      </h2>
      {lead && <p className="max-w-[62ch] text-felt-muted">{lead}</p>}
    </div>
  )
}

function DeckLink({ game, index }: { game: GameInfo; index: number }) {
  const { short } = GAME_IDENTITY[game.id]
  const [card = "AS"] = game.sample
  const suit = suitOf(card)
  const red = suit === "H" || suit === "D"
  return (
    <Link
      href={`#${game.rulesAnchor}`}
      style={{ rotate: `${(index - 2.5) * 2.2}deg` }}
      className={cn(
        "playing-card group/deck relative flex aspect-[5/7] w-full flex-col justify-between rounded-xl p-2.5 ring-1 ring-black/15 transition-[translate,rotate,box-shadow] duration-300 ease-snap outline-none hover:-translate-y-2 hover:rotate-0 hover:shadow-lift focus-visible:-translate-y-2 focus-visible:ring-[3px] focus-visible:ring-sky-400 sm:p-3",
        red ? "text-suit-red" : "text-suit-black"
      )}
    >
      <span className="flex flex-col items-start gap-0.5 leading-none">
        <span className="font-heading text-xl font-semibold sm:text-2xl">
          {rankOf(card)}
        </span>
        <SuitIcon suit={suit} className="size-3.5 sm:size-4" />
      </span>
      <SuitIcon
        suit={suit}
        className="mx-auto size-8 transition-transform duration-300 ease-snap group-hover/deck:scale-110 sm:size-10"
      />
      <span className="flex flex-col gap-0.5 text-suit-black">
        <span className="font-heading text-sm leading-tight font-semibold sm:text-base">
          {short}
        </span>
        <span className="text-[0.7rem] leading-tight text-suit-black/70 sm:text-xs">
          {describePlayerCounts(game)}
        </span>
      </span>
    </Link>
  )
}

function GameFacts({ game }: { game: GameInfo }) {
  const facts = [
    { label: "Jogadores", value: describePlayerCounts(game) },
    { label: "Formato", value: game.mode },
    { label: "Baralho", value: game.deck },
    { label: "Tempo da vez", value: `${game.turnSeconds} s, ajustável` },
  ]
  return (
    <dl className="hairline grid grid-cols-2 gap-x-6 gap-y-3 border-y py-4 sm:grid-cols-4">
      {facts.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-felt-muted">{label}</dt>
          <dd className="text-sm font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function GameRules({ game }: { game: GameInfo }) {
  const { suit } = GAME_IDENTITY[game.id]
  const headingId = `${game.rulesAnchor}-titulo`
  return (
    <section
      id={game.rulesAnchor}
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-6", SECTION_SCROLL)}
    >
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <h2
            id={headingId}
            className={cn(
              DISPLAY,
              "text-[clamp(2.25rem,5vw,3.25rem)] leading-none"
            )}
          >
            {game.name}
          </h2>
          <p className="max-w-xl text-lg/relaxed text-felt-muted">
            {game.tagline}
          </p>
        </div>
        <div
          aria-hidden
          className="flex shrink-0 -space-x-7 self-start pr-2 sm:self-end"
        >
          {game.sample.map((card, index) => (
            <CardFace
              key={card}
              card={card}
              size="flying"
              className={cn(
                "shadow-lift",
                index === 0 && "-rotate-10",
                index === 1 && "z-10 -translate-y-2",
                index === 2 && "rotate-10"
              )}
            />
          ))}
        </div>
      </header>

      <GameFacts game={game} />

      <ul className="flex flex-col gap-2 text-[0.95rem]/relaxed">
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

      <dl className="grid gap-x-10 md:grid-cols-2">
        {RULES[game.id].map(({ title, text }) => (
          <div
            key={title}
            className="hairline flex flex-col gap-1.5 border-t py-5"
          >
            <dt className="font-heading text-xl font-semibold">{title}</dt>
            <dd className="text-[0.95rem]/relaxed text-felt-muted">{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function IconRow({
  icon: Icon,
  title,
  text,
  step,
}: {
  icon: typeof Plus
  title: string
  text: string
  step?: number
}) {
  return (
    <li className="hairline grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-t py-5">
      <span className="relative row-span-2 flex size-11 items-center justify-center rounded-full bg-felt-deep ring-1 ring-gold/40">
        <Icon aria-hidden className="size-5 text-gold" />
        {step !== undefined && (
          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-gold font-heading text-xs font-semibold text-gold-foreground">
            {step}
          </span>
        )}
      </span>
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <p className="text-[0.95rem]/relaxed text-felt-muted">{text}</p>
    </li>
  )
}

export default function InformationPage() {
  return (
    <div className="flex min-h-svh flex-col overflow-x-clip">
      <SiteHeader links={HEADER_LINKS} cta={HEADER_CTA} />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-6 pb-16 sm:pt-10">
          <header className="flex flex-col gap-8">
            <Breadcrumb>
              <BreadcrumbList className="text-sm text-felt-muted">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/"
                      className="inline-flex min-h-11 items-center hover:text-gold"
                    >
                      Início
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-felt-foreground">
                    Regras e informações
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex max-w-3xl flex-col gap-4">
              <h1
                className={cn(
                  DISPLAY,
                  "text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.98]"
                )}
              >
                As regras da mesa
              </h1>
              <p className="max-w-[60ch] text-lg/relaxed text-felt-muted">
                Como começar, as regras de cada jogo do jeito que o Naipe Real
                aplica e o que acontece por trás de cada partida. Escolha uma
                carta para ir direto ao jogo.
              </p>
            </div>
            <nav aria-label="Ir para as regras de um jogo">
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
                {GAMES.map((game, index) => (
                  <li key={game.id}>
                    <DeckLink game={game} index={index} />
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
            <InfoNav sections={SECTIONS} />

            <div className="flex min-w-0 flex-col gap-20">
              <section
                id="informacoes-gerais"
                aria-labelledby="informacoes-gerais-titulo"
                className={cn("flex flex-col gap-4", SECTION_SCROLL)}
              >
                <SectionHeading
                  id="informacoes-gerais-titulo"
                  lead="Naipe Real é um site para jogar baralho online com os amigos. No Poker e no Blackjack as fichas são de mentira: ninguém aposta dinheiro."
                >
                  Para começar
                </SectionHeading>
                <ol className="flex flex-col">
                  {GENERAL_STEPS.map(({ icon, title, text }, index) => (
                    <IconRow
                      key={title}
                      icon={icon}
                      title={title}
                      text={text}
                      step={index + 1}
                    />
                  ))}
                </ol>
              </section>

              {GAMES.map((game) => (
                <GameRules key={game.id} game={game} />
              ))}

              <section
                id="sobre-o-sistema"
                aria-labelledby="sobre-o-sistema-titulo"
                className={cn("flex flex-col gap-4", SECTION_SCROLL)}
              >
                <SectionHeading id="sobre-o-sistema-titulo">
                  Sobre o sistema
                </SectionHeading>
                <ul className="flex flex-col">
                  {SYSTEM_INFO.map(({ icon, title, text }) => (
                    <IconRow
                      key={title}
                      icon={icon}
                      title={title}
                      text={text}
                    />
                  ))}
                </ul>
              </section>

              <section
                aria-labelledby="pronto-titulo"
                className="felt-surface flex flex-col items-start gap-4 rounded-[2rem] px-6 py-10 shadow-lift ring-1 ring-gold/40 sm:px-10"
              >
                <h2
                  id="pronto-titulo"
                  className={cn(
                    DISPLAY,
                    "text-[clamp(2rem,4vw,2.75rem)] leading-[1.05]"
                  )}
                >
                  Já sabe as regras? Então embaralha.
                </h2>
                <p className="max-w-md text-felt-muted">
                  Crie uma sala em segundos e mande o link no grupo.
                </p>
                <GameButton asChild tone="gold" className="h-12 px-6 text-base">
                  <Link href="/#entrar">
                    <Plus aria-hidden />
                    Criar uma sala
                  </Link>
                </GameButton>
              </section>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
