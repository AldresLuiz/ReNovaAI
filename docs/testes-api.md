# Testes da API (backend)

Relatório dos testes das rotas de resíduos, pontos e da rota de foto (Bedrock), feitos em **02/10/2026**. Os testes do banco (funções SQL) estão em [testes-banco.md](testes-banco.md).

## Como foi testado

| Rodada | Onde | Para quê |
| --- | --- | --- |
| 1. Banco falso | Cópia do `src` rodando local, com o `pool` do `pg` trocado por uma função falsa | Validar a lógica das rotas (status, formato, validação) sem depender de banco |
| 2. Supabase real, branch | API local (`node --env-file=.env src/index.js`, porta 3000) ligada ao Supabase pelo **pooler**, em `rafael/endpoints-residuos` | Provar que as rotas chamam as funções SQL certas, com os dados reais |
| 3. Supabase real, `main` | A mesma API, na `main` (commit `320d6e5`, depois do merge dos PRs #25 e #26) | Garantir que o que foi mergeado funciona |
| 4. Rota de foto, `main` | API local na `main` (commit `02ae708`, depois do PR #27), com `curl -F`, com a senha do banco certa e errada; mais testes com **Bedrock falso** | Validar upload, erros e o isolamento do banco sem credenciais da AWS |
| 5. Site completo, local | Backend na `main` (commit `1507b0e`) servindo o front e a API na mesma origem, ligado ao Supabase | Validar o que o front faz com `API_URL = ""` |
| 6. Produção, por fora | `curl` em `https://renovaai-demo.vercel.app` | Ver o que está no ar |

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

## Rota de foto: `POST /api/identificar-foto` (Bedrock, fase 2)

Testada na `main` (commit `02ae708`, depois do PR #27), com `curl -F` e `image` como nome do campo.

| Chamada | Esperado | Resultado |
| --- | --- | --- |
| Sem imagem | Erro de pedido | 400, `{erro: "Envie uma foto do resíduo."}` |
| Arquivo `.txt` | Erro de pedido | 400, `{erro: "Envie uma foto em JPG, PNG ou WebP."}` |
| PNG de 6 MB | Muito grande | 413, `{erro: "A foto é grande demais. Envie uma de até 5 MB."}` |
| Campo com nome errado (`file`) | Erro de pedido | 400, `{erro: "Não conseguimos ler a foto. Tente enviar de novo."}` |
| Foto válida, sem credenciais da AWS | Falha da IA, erro genérico | 500, `{erro: "Não conseguimos identificar o resíduo agora. Tente de novo em instantes."}` |
| Rota antiga `POST /classify` | Não existe mais | 404, `{erro: "Rota não encontrada."}` |

**Isolamento do banco.** Com a **senha do banco errada**, antes do PR #27 a API inteira nem subia (consulta ao banco no carregamento do módulo do Bedrock). Na `main`, com a senha errada: a API sobe, a rota de foto responde 400/413 normalmente, `/api/categorias` devolve o 500 genérico e `/api/geocodificar` continua funcionando. Com a senha certa, busca e pontos seguem OK.

**Com Bedrock e banco falsos** (controller real e `multer` real, upload por HTTP):
- PNG, JPEG e WebP devolvem 200 `{ message, data: { type, recycle } }`, com o formato e os bytes certos enviados ao modelo.
- A resposta do modelo cercada por ```json é lida normalmente.
- O módulo não consulta o banco ao ser importado. Com o banco fora, só a foto falha; quando o banco volta, ela funciona (a falha não fica em cache), e 3 chamadas fazem 2 consultas (cache).
- O prompt lista as categorias pelo nome (antes saía `[object Object]`).

**Não testado:** a chamada real à AWS Bedrock (faltam `BEDROCK_MODEL_ID`, região e credenciais no ambiente de teste) e uma foto real de resíduo.

**Ainda diverge do contrato:** o sucesso devolve `{ message, data: { type, recycle } }`, com a **categoria** em `type`, e não os ids de resíduos do banco. Decisão pendente com Aldres e Bernardo.

## Site completo, local (commit `1507b0e`)

Com o backend servindo o front (`express.static`) e `API_URL = ""`: `/`, `/residuo.html`, `/js/config.js`, `/js/api.js` e `/css/style.css` respondem 200; e as chamadas na mesma origem (`/api/categorias`, `/api/residuos?q=latinha`, `/api/residuos/1`, `/api/residuos/2/pontos`) devolvem 200 com dados do Supabase (o texto do resíduo 1 vem do `06`, sem "RASCUNHO:").

## Produção, por fora (`renovaai-demo.vercel.app`, 02/10)

| O que | Resultado |
| --- | --- |
| `/api/categorias`, `/api/residuos?q=latinha`, `?q=pilah`, `/api/residuos/1` | 200, dados certos (do Supabase, com o texto do `06`) |
| `/api/residuos/2/pontos` no centro de Caruaru | 200, `inicial`, Drogasil Frei Caneca em primeiro |
| `/pontos` sem `lat`/`lng`; `/api/residuos/999` | 400 e 404, com `{erro}` |
| `/api/geocodificar?q=Caruaru` | 200, coordenada certa |
| `POST /api/identificar-foto` sem imagem; `POST /classify` | 400 `{erro}`; 404 (o backend no ar tem o código mais recente) |
| `OPTIONS /api/categorias` | 204 |
| **Front servido** (`/js/config.js`) | **`USAR_MOCK = true` e `API_URL = "http://localhost:3000"`**: é o front do dia 01/10 (igual ao que a `main` tinha antes dos commits de 02/10 do Bernardo). Ele **nunca chama a API** e mostra os pontos fictícios do `mocks.js` |

Ou seja: a **API em produção funciona**, mas o **front que essa URL mostra está desatualizado e em mock**. A resposta traz `Server: Vercel` também em `/api/*`, então a Vercel repassa `/api` para o backend (esse redirecionamento não está no repositório). Segundo o Aldres, o site também é servido pelo próprio backend, em outro endereço (que não conseguimos testar sem o domínio). Detalhes e o que fazer: [guia-deploy.md](guia-deploy.md).

## Geocodificação de bairros de Caruaru

`GET /api/geocodificar` testado local (Nominatim), em 02/10:

| Busca | Resultado |
| --- | --- |
| `Caruaru`, `Caruaru, PE`, `Nova Caruaru`, `Recife`, `Bezerros` | 200, coordenada certa |
| `Indianópolis`, `Indianópolis, Caruaru`, `Indianópolis, Caruaru, Pernambuco`, `Petrópolis, Caruaru`, `Universitário, Caruaru`, `Maurício de Nassau, Caruaru` | **404** ("Não encontramos esse local") |
| `Centro, Caruaru` | **200, mas com coordenada errada** (-8,88, -36,49), a cerca de 70 km de Caruaru |

O OpenStreetMap cobre mal os bairros de Caruaru. O pior caso é o "Centro": não dá erro e devolve um lugar errado, então os pontos listados ficariam distantes. Para a demo ("Recusar a localização e buscar por bairro"), só buscar por **"Caruaru"** funciona de forma confiável. Possíveis saídas (não implementadas): restringir a busca à região de Caruaru no Nominatim, ou uma lista fixa de bairros com coordenada.

## O que ainda NÃO foi testado

- **O site completo no ar, no celular**, e o front atual publicado (o da Vercel estava desatualizado em 02/10). A API em produção foi testada só por `curl`.
- **O domínio do backend que serve o site**: não temos a URL; só testamos o domínio da Vercel.
- **Resíduo inativo devolvendo 404 por id**, contra o banco real: hoje os 9 estão ativos. Só foi testado com o banco falso.
- **A AWS Bedrock de verdade** (veja a seção da rota de foto).
- **`/api/geocodificar`** e **autenticação**: fora deste relatório.
- **Carga e concorrência.**

## Como repetir

Veja "Testar a API" em [guia-backend.md](guia-backend.md#testar-a-api).
