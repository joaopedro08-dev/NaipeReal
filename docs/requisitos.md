# Naipe Real: índice de requisitos

Os códigos RF, RN e RNF citados no código, nos testes e na documentação vêm dos documentos de requisitos de cada jogo, que não estão neste repositório. Este índice junta, para cada código, o assunto que o projeto atribui a ele e onde ele é verificado.

O assunto vem dos títulos dos testes e das tabelas de regras em [arquitetura-backend.md](arquitetura-backend.md). Quando um teste ou regra novo citar um código, acrescente a linha aqui.

| Prefixo                      | Significado                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `RF`                         | Requisito funcional: o que a tela ou o servidor fazem                                           |
| `RN`                         | Regra de negócio: a regra do jogo                                                               |
| `RNF`                        | Requisito não funcional: segurança, desempenho, limpeza                                         |
| `TR`, `TT`, `PK`, `CA`, `BJ` | Truco Paulista, Três Trincas, Poker, Cacheta e Blackjack. Sem prefixo, Rouba Monte e plataforma |

## Plataforma e Rouba Monte

Origem: Documento de requisitos do Rouba Monte e da plataforma.

| Código | Assunto                                                                   | Verificado em                                                                                                                                 |
| ------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-01  | criar sala                                                                | `backend/test/application/use-cases.test.ts`, `backend/test/integration/socket.test.ts`                                                       |
| RF-02  | entrar                                                                    | `backend/test/application/use-cases.test.ts`, `backend/test/domain/room.test.ts`                                                              |
| RF-03  | sala, testada junto de RF-01 e RF-02                                      | `backend/test/integration/socket.test.ts`                                                                                                     |
| RF-04  | início                                                                    | `backend/test/application/use-cases.test.ts`, `backend/test/domain/room.test.ts`                                                              |
| RF-05  | remover jogador                                                           | `backend/test/application/use-cases.test.ts`, `backend/test/integration/socket.test.ts`                                                       |
| RF-06  | reconexão                                                                 | `backend/test/application/use-cases.test.ts`, `backend/test/integration/socket.test.ts`                                                       |
| RF-07  | distribui e informa o prazo do turno                                      | `backend/test/application/use-cases.test.ts`, `backend/test/integration/socket.test.ts`                                                       |
| RF-08  | só o jogador da vez consegue agir                                         | `backend/test/integration/socket.test.ts`                                                                                                     |
| RF-09  | toda jogada é validada no servidor                                        | `backend/test/application/use-cases.test.ts`, `backend/test/domain/turn-actions.test.ts`, `backend/test/integration/socket.test.ts`           |
| RF-10  | jogadas: uma jogada fecha o turno                                         | `backend/test/application/use-cases.test.ts`, `backend/test/domain/turn-flow.test.ts`, `backend/test/integration/socket.test.ts`              |
| RF-11  | ação chega a todos e o turno passa                                        | `backend/test/integration/socket.test.ts`                                                                                                     |
| RF-12  | desfazer jogada (removido: a jogada fecha o turno)                        | só na documentação                                                                                                                            |
| RF-13  | frases do histórico                                                       | `backend/test/adapters/messages.test.ts`, `backend/test/integration/socket.test.ts`                                                           |
| RF-15  | jogar de novo                                                             | `backend/test/application/use-cases.test.ts`, `backend/test/domain/room.test.ts`, `backend/test/integration/socket.test.ts`                   |
| RF-16  | jogadas possíveis                                                         | `backend/test/domain/view-and-hints.test.ts`, `backend/test/integration/socket.test.ts`                                                       |
| RF-17  | frases das dicas                                                          | `backend/test/adapters/messages.test.ts`, `backend/test/application/use-cases.test.ts`, `backend/test/domain/view-and-hints.test.ts`          |
| RF-18  | alerta de risco                                                           | `backend/test/adapters/messages.test.ts`, `backend/test/domain/view-and-hints.test.ts`                                                        |
| RF-19  | contador e informação pública                                             | `backend/test/domain/view-and-hints.test.ts`, `backend/test/integration/socket.test.ts`                                                       |
| RF-20  | dicas                                                                     | `backend/test/application/use-cases.test.ts`, `backend/test/domain/truco-hints.test.ts`, `backend/test/domain/view-and-hints.test.ts`         |
| RF-23  | tempo de turno                                                            | `backend/test/application/use-cases.test.ts`                                                                                                  |
| RF-24  | contagem regressiva antes da partida                                      | só na documentação                                                                                                                            |
| RF-25  | só o anfitrião troca o jogo, antes de iniciar, e recusa jogo desconhecido | `backend/test/application/second-game.test.ts`, `backend/test/domain/teams.test.ts`, `backend/test/integration/truco-socket.test.ts` e mais 1 |

Sem citação no projeto: RF-14, RF-21, RF-22.

| Código | Assunto                            | Verificado em                                                                                                                    |
| ------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| RN-01  | quantidade de jogadores            | `backend/test/domain/setup.test.ts`                                                                                              |
| RN-02  | distribuição                       | `backend/test/domain/setup.test.ts`                                                                                              |
| RN-03  | quem começa                        | `backend/test/domain/setup.test.ts`                                                                                              |
| RN-04  | fecha o turno depois de uma jogada | `backend/test/domain/turn-actions.test.ts`, `backend/test/domain/turn-flow.test.ts`, `backend/test/integration/socket.test.ts`   |
| RN-05  | capturar                           | `backend/test/domain/turn-actions.test.ts`                                                                                       |
| RN-06  | pôr no próprio monte               | `backend/test/domain/turn-actions.test.ts`                                                                                       |
| RN-07  | roubar                             | `backend/test/domain/turn-actions.test.ts`                                                                                       |
| RN-08  | roubar                             | `backend/test/domain/turn-actions.test.ts`                                                                                       |
| RN-09  | descartar                          | `backend/test/domain/turn-actions.test.ts`                                                                                       |
| RN-10  | mão sempre volta a 4 cartas        | `backend/test/domain/turn-flow.test.ts`                                                                                          |
| RN-11  | reposição da mesa                  | `backend/test/domain/turn-flow.test.ts`                                                                                          |
| RN-12  | baralho vazio                      | `backend/test/domain/turn-flow.test.ts`                                                                                          |
| RN-13  | fim da partida                     | `backend/test/domain/turn-flow.test.ts`                                                                                          |
| RN-14  | fim da partida                     | `backend/test/domain/turn-flow.test.ts`                                                                                          |
| RN-15  | só o topo de cada monte é visível  | `backend/test/domain/view-and-hints.test.ts`                                                                                     |
| RN-16  | jogador sai no meio da partida     | `backend/test/application/use-cases.test.ts`, `backend/test/domain/turn-flow.test.ts`, `backend/test/integration/socket.test.ts` |
| RN-17  | tempo de turno                     | `backend/test/domain/turn-flow.test.ts`                                                                                          |

| Código | Assunto                                              | Verificado em                                                                           |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| RNF-04 | nenhuma carta escondida sai do servidor              | `backend/test/domain/view-and-hints.test.ts`, `backend/test/integration/socket.test.ts` |
| RNF-05 | embaralhamento                                       | `backend/test/domain/setup.test.ts`                                                     |
| RNF-06 | 10 salas de 6 jogadores com ação entregue em até 1 s | só na documentação                                                                      |
| RNF-07 | limpeza                                              | `backend/test/application/use-cases.test.ts`, `backend/test/domain/room.test.ts`        |
| RNF-11 | apelido nunca vai para o log                         | só na documentação                                                                      |

Sem citação no projeto: RNF-01, RNF-02, RNF-03, RNF-08, RNF-09, RNF-10.

## Truco Paulista

Origem: Documento de requisitos do Truco Paulista.

| Código   | Assunto                                 | Verificado em                                                                        |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| TR-RF-01 | partida de 4 jogadores                  | `backend/test/integration/truco-socket.test.ts`                                      |
| TR-RF-02 | ações da vez enviadas por `game:action` | só na documentação                                                                   |
| TR-RF-06 | partida de 4 jogadores                  | `backend/test/integration/truco-socket.test.ts`                                      |
| TR-RF-08 | ações da vez enviadas por `game:action` | só na documentação                                                                   |
| TR-RF-09 | times na sala                           | `backend/test/domain/teams.test.ts`, `backend/test/integration/truco-socket.test.ts` |
| TR-RF-12 | frases do histórico e das dicas         | `backend/test/domain/truco-hints.test.ts`                                            |
| TR-RF-13 | régua de força                          | `backend/test/domain/truco-hints.test.ts`                                            |
| TR-RF-14 | sugestões com a própria mão             | `backend/test/domain/truco-hints.test.ts`                                            |

Sem citação no projeto: TR-RF-03, TR-RF-04, TR-RF-05, TR-RF-07, TR-RF-10, TR-RF-11.

| Código   | Assunto                             | Verificado em                                                                        |
| -------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| TR-RN-01 | jogadores, times e assentos         | `backend/test/domain/teams.test.ts`, `backend/test/domain/truco.test.ts`             |
| TR-RN-02 | baralho de 40 cartas e distribuição | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-03 | força das cartas e manilha          | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-04 | quem abre a mão                     | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-05 | rodadas e mão                       | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-06 | empates                             | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-07 | quem abre depois do empate          | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-08 | pedidos de aumento                  | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-10 | pedidos de aumento                  | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-11 | mão de onze                         | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-12 | mão de ferro                        | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-13 | fim da partida                      | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-14 | visibilidade                        | `backend/test/domain/truco.test.ts`                                                  |
| TR-RN-15 | saída pelo botão                    | `backend/test/domain/truco.test.ts`, `backend/test/integration/truco-socket.test.ts` |
| TR-RN-16 | tempo de 30 segundos                | `backend/test/domain/truco.test.ts`                                                  |

Sem citação no projeto: TR-RN-09.

## Três Trincas

Origem: Documento de requisitos do Três Trincas.

| Código   | Assunto             | Verificado em                                                                                                                                            |
| -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TT-RF-01 | partida pelo socket | `backend/test/integration/tres-trincas-socket.test.ts`                                                                                                   |
| TT-RF-02 | vez e próximo passo | `frontend/lib/game/domain/tres-trincas/guide.test.ts`                                                                                                    |
| TT-RF-06 | partida pelo socket | `backend/test/integration/tres-trincas-socket.test.ts`                                                                                                   |
| TT-RF-07 | fim de partida      | `frontend/lib/game/domain/tres-trincas/guide.test.ts`                                                                                                    |
| TT-RF-09 | frases do histórico | `backend/test/adapters/tres-trincas-messages.test.ts`                                                                                                    |
| TT-RF-10 | mão organizada      | `backend/test/adapters/tres-trincas-messages.test.ts`, `backend/test/domain/tres-trincas.test.ts`, `frontend/lib/game/domain/tres-trincas/guide.test.ts` |
| TT-RF-11 | frases das dicas    | `backend/test/adapters/tres-trincas-messages.test.ts`, `backend/test/domain/tres-trincas.test.ts`                                                        |

Sem citação no projeto: TT-RF-03, TT-RF-04, TT-RF-05, TT-RF-08.

| Código   | Assunto                   | Verificado em                                                                                      |
| -------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| TT-RN-01 | sala do Três Trincas      | `backend/test/domain/tres-trincas.test.ts`, `backend/test/integration/tres-trincas-socket.test.ts` |
| TT-RN-04 | preparação                | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-05 | trincas e coringa         | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-08 | trincas e coringa         | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-09 | vez normal e baixar       | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-10 | vez normal e baixar       | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-11 | mão diminui a cada trinca | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-13 | mão diminui a cada trinca | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-14 | monte de compra refeito   | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-15 | fim                       | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-16 | visibilidade              | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-17 | tempo de turno            | `backend/test/domain/tres-trincas.test.ts`                                                         |
| TT-RN-18 | saída no meio da partida  | `backend/test/domain/tres-trincas.test.ts`                                                         |

Sem citação no projeto: TT-RN-02, TT-RN-03, TT-RN-06, TT-RN-07, TT-RN-12.

## Poker Texas Hold'em

Origem: Documento de requisitos do Poker.

| Código   | Assunto                                                            | Verificado em                                                                                                                        |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| PK-RF-01 | partida pelo socket                                                | `backend/test/integration/poker-socket.test.ts`                                                                                      |
| PK-RF-02 | mesa abre flop, turn e river quando a rodada fecha                 | só na documentação                                                                                                                   |
| PK-RF-03 | contrato das ações                                                 | `backend/test/adapters/poker-messages.test.ts`, `backend/test/domain/poker.test.ts`, `frontend/lib/game/domain/poker/guide.test.ts`  |
| PK-RF-04 | valor da aposta                                                    | `frontend/lib/game/domain/poker/guide.test.ts`                                                                                       |
| PK-RF-05 | all-in de 3 jogadores com valores diferentes forma potes paralelos | `backend/test/domain/poker.test.ts`                                                                                                  |
| PK-RF-07 | resultado da mão                                                   | `frontend/lib/game/domain/poker/guide.test.ts`                                                                                       |
| PK-RF-08 | mostra blinds, quantas mãos faltam para dobrar e as próximas       | `backend/test/domain/poker.test.ts`, `frontend/lib/game/domain/poker/guide.test.ts`                                                  |
| PK-RF-09 | fim da partida                                                     | `backend/test/integration/poker-socket.test.ts`, `frontend/lib/game/domain/poker/guide.test.ts`                                      |
| PK-RF-10 | placar, blinds e posições                                          | `frontend/lib/game/domain/poker/guide.test.ts`                                                                                       |
| PK-RF-12 | entrega o jogo atual como dica                                     | `backend/test/adapters/poker-messages.test.ts`, `backend/test/domain/poker.test.ts`, `backend/test/integration/poker-socket.test.ts` |
| PK-RF-13 | frases das dicas                                                   | `backend/test/adapters/poker-messages.test.ts`, `backend/test/domain/poker.test.ts`                                                  |
| PK-RF-14 | frases do histórico                                                | `backend/test/adapters/poker-messages.test.ts`                                                                                       |

Sem citação no projeto: PK-RF-06, PK-RF-11.

| Código   | Assunto            | Verificado em                                                                        |
| -------- | ------------------ | ------------------------------------------------------------------------------------ |
| PK-RN-01 | sala do Poker      | `backend/test/domain/poker.test.ts`, `backend/test/integration/poker-socket.test.ts` |
| PK-RN-04 | preparação         | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-05 | blinds             | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-07 | blinds             | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-08 | rodadas de aposta  | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-09 | apostas sem limite | só na documentação                                                                   |
| PK-RN-11 | rodadas de aposta  | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-12 | todos desistem     | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-13 | showdown e potes   | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-14 | kicker e empate    | `backend/test/domain/poker-hand-ranking.test.ts`                                     |
| PK-RN-15 | showdown e potes   | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-16 | eliminação e fim   | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-17 | visibilidade       | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-18 | tempo              | `backend/test/domain/poker.test.ts`                                                  |
| PK-RN-19 | saída              | `backend/test/domain/poker.test.ts`                                                  |

Sem citação no projeto: PK-RN-02, PK-RN-03, PK-RN-06, PK-RN-10.

## Cacheta

Origem: Documento de requisitos da Cacheta.

| Código   | Assunto                                 | Verificado em                                     |
| -------- | --------------------------------------- | ------------------------------------------------- |
| CA-RF-01 | partida pelo socket                     | `backend/test/integration/cacheta-socket.test.ts` |
| CA-RF-02 | vez e próximo passo                     | `frontend/lib/game/domain/cacheta/guide.test.ts`  |
| CA-RF-03 | ações da vez enviadas por `game:action` | só na documentação                                |
| CA-RF-04 | partida pelo socket                     | `backend/test/integration/cacheta-socket.test.ts` |
| CA-RF-05 | organizar a mão                         | `frontend/lib/game/domain/cacheta/guide.test.ts`  |
| CA-RF-06 | resultado da batida                     | `frontend/lib/game/domain/cacheta/guide.test.ts`  |
| CA-RF-08 | resultado da batida                     | `frontend/lib/game/domain/cacheta/guide.test.ts`  |
| CA-RF-09 | fim da partida                          | `frontend/lib/game/domain/cacheta/guide.test.ts`  |
| CA-RF-11 | dicas                                   | `backend/test/domain/cacheta.test.ts`             |
| CA-RF-12 | dicas                                   | `backend/test/domain/cacheta.test.ts`             |
| CA-RF-13 | frases do histórico                     | `backend/test/adapters/cacheta-messages.test.ts`  |

Sem citação no projeto: CA-RF-07, CA-RF-10.

| Código   | Assunto              | Verificado em                                                                            |
| -------- | -------------------- | ---------------------------------------------------------------------------------------- |
| CA-RN-01 | sala da Cacheta      | `backend/test/domain/cacheta.test.ts`, `backend/test/integration/cacheta-socket.test.ts` |
| CA-RN-04 | coringa pelo vira    | `backend/test/domain/cacheta-melds.test.ts`                                              |
| CA-RN-06 | preparação           | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-07 | trinca               | `backend/test/domain/cacheta-melds.test.ts`                                              |
| CA-RN-08 | sequência            | `backend/test/domain/cacheta-melds.test.ts`                                              |
| CA-RN-09 | coringa              | `backend/test/domain/cacheta-melds.test.ts`                                              |
| CA-RN-10 | vez                  | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-11 | arranjo da mão       | `backend/test/domain/cacheta-melds.test.ts`, `backend/test/domain/cacheta.test.ts`       |
| CA-RN-12 | monte de compra      | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-13 | bater                | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-14 | eliminação e vitória | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-15 | visibilidade         | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-16 | tempo                | `backend/test/domain/cacheta.test.ts`                                                    |
| CA-RN-17 | saída                | `backend/test/domain/cacheta.test.ts`                                                    |

Sem citação no projeto: CA-RN-02, CA-RN-03, CA-RN-05.

## Blackjack

Origem: Documento de requisitos do Blackjack.

| Código   | Assunto                                 | Verificado em                                                                                           |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| BJ-RF-01 | partida pelo socket                     | `backend/test/integration/blackjack-socket.test.ts`, `frontend/lib/game/domain/blackjack/guide.test.ts` |
| BJ-RF-03 | soma da mão                             | `frontend/lib/game/domain/blackjack/guide.test.ts`                                                      |
| BJ-RF-04 | partida pelo socket                     | `backend/test/integration/blackjack-socket.test.ts`, `frontend/lib/game/domain/blackjack/guide.test.ts` |
| BJ-RF-06 | ações da vez enviadas por `game:action` | só na documentação                                                                                      |
| BJ-RF-07 | vez da banca                            | só na documentação                                                                                      |
| BJ-RF-09 | vez e rodada                            | `frontend/lib/game/domain/blackjack/guide.test.ts`                                                      |
| BJ-RF-10 | fim da partida                          | `frontend/lib/game/domain/blackjack/guide.test.ts`                                                      |
| BJ-RF-11 | sala do Blackjack                       | `backend/test/integration/blackjack-socket.test.ts`                                                     |
| BJ-RF-13 | frases da dica                          | `backend/test/adapters/blackjack-messages.test.ts`, `backend/test/domain/blackjack-strategy.test.ts`    |
| BJ-RF-14 | frases do histórico                     | `backend/test/adapters/blackjack-messages.test.ts`                                                      |

Sem citação no projeto: BJ-RF-02, BJ-RF-05, BJ-RF-08, BJ-RF-12.

| Código   | Assunto                     | Verificado em                                                                                |
| -------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| BJ-RN-01 | preparação                  | `backend/test/domain/blackjack.test.ts`, `backend/test/integration/blackjack-socket.test.ts` |
| BJ-RN-02 | distribuição                | só na documentação                                                                           |
| BJ-RN-04 | preparação                  | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-05 | valores                     | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-06 | valores                     | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-07 | apostas                     | `backend/test/domain/blackjack.test.ts`, `frontend/lib/game/domain/blackjack/guide.test.ts`  |
| BJ-RN-08 | distribuição e visibilidade | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-09 | blackjack da banca          | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-10 | pedir e parar               | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-11 | dobrar                      | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-12 | dividir                     | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-13 | vez da banca                | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-14 | pagamento                   | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-15 | fim                         | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-16 | fim                         | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-17 | distribuição e visibilidade | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-18 | tempo                       | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-19 | baralho acabando            | `backend/test/domain/blackjack.test.ts`                                                      |
| BJ-RN-20 | saída                       | `backend/test/domain/blackjack.test.ts`                                                      |

Sem citação no projeto: BJ-RN-03.
