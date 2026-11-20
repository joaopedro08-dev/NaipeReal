# Segurança

Encontrou uma falha? Não abra uma issue pública. Use **Security > Report a vulnerability** neste repositório, com os passos para reproduzir e o que ela permite fazer.

## O que está no escopo

- Ver a mão de outro jogador, as cartas abaixo do topo dos montes ou a ordem do baralho de compra
- Agir no lugar de outra pessoa ou entrar no lugar dela em uma sala, inclusive adivinhando a chave de volta
- Contornar os limites por IP, de mensagens ou de salas
- Derrubar o servidor ou deixar as salas indisponíveis para os outros

## O que o jogo guarda

Não há cadastro nem banco de dados. As salas ficam na memória do servidor e somem quando ele reinicia.

No navegador, o `localStorage` guarda:

| Chave                     | Conteúdo                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `naipe-real:assento`      | Código da sala, apelido, identificador do jogador e a chave para voltar à sala                                                   |
| `naipe-real:preferencias` | Apelido e preferências: sons, animações reduzidas, tamanho das cartas, tutorial automático, código visível e tutoriais já vistos |
| `naipe-real:dicas`        | Se o jogador desligou as dicas para si                                                                                           |

Nada disso sai do aparelho, exceto o apelido, o código e a chave, enviados ao servidor para entrar ou voltar à sala. A chave de volta é comparada em tempo constante e nunca aparece nos logs.
