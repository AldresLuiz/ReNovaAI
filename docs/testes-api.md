# Testes da API (backend)

Relatório dos testes das rotas de resíduos e pontos, feitos em **02/10/2026**. Os testes do banco (funções SQL) estão em [testes-banco.md](testes-banco.md).

## Como foi testado

| Rodada | Onde | Para quê |
| --- | --- | --- |
| 1. Banco falso | Cópia do `src` rodando local, com o `pool` do `pg` trocado por uma função falsa | Validar a lógica das rotas (status, formato, validação) sem depender de banco |
| 2. Supabase real, branch | API local (`node --env-file=.env src/index.js`, porta 3000) ligada ao Supabase pelo **pooler**, em `rafael/endpoints-residuos` | Provar que as rotas chamam as funções SQL certas, com os dados reais |
| 3. Supabase real, `main` | A mesma API, na `main` (commit `320d6e5`, depois do merge dos PRs #25 e #26) | Garantir que o que foi mergeado funciona |

Só foram feitas consultas de leitura (`select`) no banco. Nada foi escrito.

## Resultado na `main` contra o Supabase real

| Chamada | Esperado | Resultado |
| --- | --- | --- |
| `GET /api/categorias` | 9 categorias com ícone | 200, 9 categorias |
| `GET /api/residuos?q=latinha` | Lata de alumínio | 200, similaridade 1 |
| `GET /api/residuos?q=pilah` (erro de digitação) | Pilhas e baterias | 200, similaridade 0,33 |
| `GET /api/residuos?q=remédio` | Remédio vencido | 200, similaridade 1 |
| `GET /api/residuos?q=zzzz` | Lista vazia, sem erro | 200 com `[]` |
| `GET /api/residuos` (sem `q`) | Erro simples | 400, "Digite o que você quer descartar." |
| `GET /api/residuos?q=` com 101 caracteres | Erro simples | 400, "O texto está muito grande." |
| `GET /api/residuos/2` | Orientação completa, resíduo de risco | 200, `risco: true`, `cuidados` começando por "Atenção:" |
| `GET /api/residuos/999`, `/abc`, `/0` | Não encontrado | 404 com `{erro}` |
| `GET /api/residuos/2/pontos` no centro de Caruaru | Pontos de pilhas, raio inicial | 200, `inicial`, 10 pontos, o mais perto a 0,16 km |
| Pilhas a cerca de 13 km do centro | Raio ampliado | 200, `ampliado` |
| Lata em Recife (121 km de Caruaru) | Só o ponto mais próximo | 200, `mais_proximo`, Ecoestação Indianópolis |
| Pontos sem `lat`/`lng`, ou `lat=abc` | Erro simples | 400 com `{erro}` |
| Pontos de um resíduo que não existe (999) | Não encontrado | 404 com `{erro}` |
| Rota que não existe (`/api/xyz`) | Erro no formato do contrato | 404, `{erro: "Rota não encontrada."}` |
| CORS com `Origin: http://localhost:8000` | Origem aceita | `Access-Control-Allow-Origin` devolvido; preflight `OPTIONS` responde 204 |
| Log do servidor | Sem localização do usuário (RNF07) | 0 ocorrências de `lat=` e `lng=` |

### Pontos devolvidos por resíduo (centro de Caruaru)

Bate com as ligações do [`05_seed_pontos_reais.sql`](../migrations/05_seed_pontos_reais.sql):

| Resíduo | Pontos | Mais perto |
| --- | --- | --- |
| Lata de alumínio, Garrafa PET, Papelão, Garrafa de vidro | 1 cada | Ecoestação Indianópolis (2,16 km) |
| Pilhas e baterias | 10 | Drogasil, Frei Caneca (0,16 km) |
| Celular e eletrônicos pequenos | 3 | Casas Bahia, Centro (0,26 km) |
| Óleo de cozinha usado | 1 | Compesa, loja de atendimento (0,10 km) |
| Lâmpada fluorescente | 4 | Assaí, Nossa Senhora das Dores (0,34 km) |
| Remédio vencido | 8 | Drogasil, Frei Caneca (0,16 km) |

## Rodada 1: casos extras com banco falso

Estes casos só foram testados com o banco falso, porque dependem de um estado que o banco real não tem hoje.

- `lat`/`lng` vazios (`?lat=&lng=...`), repetidos (`?lat=1&lat=2`), `Infinity`, fora de -90..90 e -180..180: todos 400, **sem chegar ao banco**.
- Limites exatos (`lat=-90&lng=180`): aceitos.
- `id` com decimal (`1.5`), negativo e maior que o `integer` do Postgres (`99999999999`): 404, sem chegar ao banco.
- Resíduo ativo, mas sem nenhum ponto: `200` com `{ raio_usado: null, pontos: [] }`.
- Banco fora do ar: `500` com a mensagem genérica "Algo deu errado. Tente de novo em instantes.", sem vazar texto técnico.
- As consultas usam parâmetros (`$1`, `$2`, `$3`), sem concatenar texto do usuário.

## O que ainda NÃO foi testado

- **O front chamando a API.** Na `main`, `renovaai-front/js/config.js` ainda tem `USAR_MOCK = true`. O site não usa essas rotas até alguém trocar para `false` e apontar o `API_URL`.
- **O deploy do Aldres.** Todos os testes foram na máquina local.
- **Resíduo inativo devolvendo 404 por id**, contra o banco real: hoje os 9 estão ativos. Só foi testado com o banco falso.
- **`/api/geocodificar`**, **autenticação** e **`POST /api/identificar-foto` (Bedrock)**: fora deste relatório.
- **Carga e concorrência.**

## Como repetir

Veja "Testar a API" em [guia-backend.md](guia-backend.md#testar-a-api).
