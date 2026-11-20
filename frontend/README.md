# Naipe Real: frontend

Interface do jogo em Next.js 16, React 19, shadcn/ui, framer-motion e GSAP. O servidor decide tudo: a tela só mostra o estado que chega em `room:state` e envia comandos.

## Camadas

| Pasta                     | Responsabilidade                                                                        | Pode importar                |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| `lib/game/domain`         | Regras de tela puras: seleção, guia do turno, placar, foco da dica e mudanças na mesa   | Só ela mesma                 |
| `lib/game/application`    | Sessão do jogo e portas (`GameGateway`, `SeatStore`, `AddressBar`)                      | Domínio                      |
| `lib/game/infrastructure` | Socket.io, `localStorage` (assento, dicas e preferências), sons e endereço do navegador | Aplicação e domínio          |
| `lib/game/session.ts`     | Monta a sessão usada pelas telas                                                        | Todas acima                  |
| `components/game`         | Telas e animações                                                                       | `lib/game` e `components/ui` |

Os esquemas dos comandos vêm do pacote `@naipe-real/contracts` (pasta `shared`), validados no gateway antes do envio. Os tipos de estado em `lib/game/domain/types.ts` e `lib/game/application/ports.ts` espelham `backend/src/adapters/socket/contract.ts`. A imagem Docker compila o frontend sem o backend, então mudanças nesses tipos precisam ser repetidas aqui.

O `pnpm build` compila `shared` antes (`prebuild`). Para o `pnpm dev`, compile uma vez com `pnpm --dir ../shared install && pnpm --dir ../shared build`.

## Preferências do jogador

O menu da partida tem um painel com sons, animações reduzidas, cartas grandes, tutorial automático e código da sala visível. As escolhas ficam em `naipe-real:preferencias` no `localStorage` e valem na hora em todas as abas abertas. Salvar o apelido ao entrar numa sala não apaga as outras escolhas.

## Animações

A tela inicial carrega sem framer-motion nem GSAP. Os dois ficam em `components/game/room/room-screens.tsx`, que é baixado em segundo plano depois que a página abre. Todas as animações respeitam `prefers-reduced-motion` e a opção de animações reduzidas do painel de preferências.

## Verificação

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm lint
```

```bash
pnpm build
```

Para jogar localmente com o servidor, use `docker compose up --build app` na raiz do projeto.

## Servidor em outro endereço

Sem variáveis, a tela conecta no próprio endereço. Com o backend separado, defina `NEXT_PUBLIC_SERVER_URL`; ela é lida na compilação. Em desenvolvimento, copie `.env.example` para `.env.local`. A publicação está em [docs/implantacao.md](../docs/implantacao.md).
