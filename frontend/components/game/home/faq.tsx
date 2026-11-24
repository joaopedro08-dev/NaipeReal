"use client"

import Link from "next/link"
import { BookOpen, Bug } from "lucide-react"

import { GameButton } from "@/components/game/game-button"
import { SectionIntro } from "@/components/game/home/section-intro"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ISSUES_URL, REPOSITORY_URL } from "@/lib/site"

const QUESTIONS = [
  {
    question: "Preciso criar uma conta?",
    answer:
      "Não. Você escolhe um apelido e entra. O navegador guarda o apelido, a chave para voltar à sala e as suas preferências, só neste aparelho.",
  },
  {
    question: "Quantas pessoas podem jogar?",
    answer:
      "No Rouba Monte, de 2 a 6 pessoas, cada uma por si. No Truco Paulista, 2, 4 ou 6 pessoas, divididas em dois times iguais. No Três Trincas, de 2 a 4 pessoas, cada uma por si. No Poker Texas Hold'em, de 2 a 6 pessoas, até sobrar uma com todas as fichas. Na Cacheta, de 2 a 4 pessoas, até sobrar uma com pontos. No Blackjack, de 1 a 6 pessoas contra a banca, inclusive sozinho.",
  },
  {
    question: "Como convido meus amigos?",
    answer:
      "Na sala, copie o link ou compartilhe o código. Quem abrir o link já cai na tela de entrada com a sala preenchida.",
  },
  {
    question: "O que acontece se a minha conexão cair?",
    answer:
      "Abra o site de novo no mesmo navegador: você volta para a mesma sala e para a sua mão. Se ficar mais de 2 minutos fora, o jogo segue sem você.",
  },
  {
    question: "Dá para mudar o tempo de cada jogada?",
    answer:
      "Sim. No saguão, o anfitrião escolhe 15, 30 ou 60 segundos por vez. Sem escolha, vale o tempo padrão do jogo.",
  },
  {
    question: "Posso ajustar sons, animações e o tamanho das cartas?",
    answer:
      "Sim. No menu da partida, o painel de preferências liga os sons, reduz as animações, aumenta as cartas e decide se o código da sala aparece sem precisar revelar.",
  },
  {
    question: "As cartas dos outros jogadores ficam escondidas?",
    answer:
      "Sim. O servidor decide tudo e só envia a você as suas próprias cartas e o que está na mesa.",
  },
  {
    question: "A sala fica salva depois da partida?",
    answer:
      "Não. As salas existem só na memória do servidor, sem banco de dados, e desaparecem quando todos saem ou o servidor reinicia.",
  },
  {
    question: "O Naipe Real é gratuito? O código é aberto?",
    answer: `É gratuito e o código é aberto, sob licença MIT. Você pode ver, sugerir melhorias ou reportar problemas no repositório: ${REPOSITORY_URL.replace("https://", "")}.`,
  },
] as const

export function Faq() {
  return (
    <section
      id="duvidas"
      aria-labelledby="duvidas-titulo"
      className="grid scroll-mt-20 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
    >
      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <SectionIntro id="duvidas-titulo" title="Perguntas de quem vai sentar">
          O essencial para começar. As regras completas de cada jogo estão na
          página de regras.
        </SectionIntro>
        <div className="flex flex-wrap gap-2">
          <GameButton asChild>
            <Link href="/informacoes">
              <BookOpen aria-hidden />
              Regras e informações
            </Link>
          </GameButton>
          <GameButton asChild>
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
              <Bug aria-hidden />
              Reportar um problema
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </GameButton>
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        className="hairline rounded-none border-0 border-t"
      >
        {QUESTIONS.map(({ question, answer }) => (
          <AccordionItem
            key={question}
            value={question}
            className="hairline border-b transition-colors data-open:bg-transparent"
          >
            <AccordionTrigger className="min-h-16 items-center px-1 py-4 font-heading text-lg font-medium hover:no-underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-gold sm:text-xl">
              {question}
            </AccordionTrigger>
            <AccordionContent className="max-w-[62ch] px-1 pb-5 text-[0.95rem]/relaxed text-felt-muted">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
