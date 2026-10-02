# Guia do backend

Node + Express 5, ESM (`import`/`export`), porta via `PORT`. Código em `src/`.

## Camadas

| Pasta | Responsabilidade |
| --- | --- |
| `controllers/` | Recebe a requisição, valida entrada, chama service, responde. Cada controller é um `Router` registrado em `src/index.js` |
| `datamodels/` | Schemas `zod` / DTOs de entrada e saída |
| `services/` | Regras e acesso ao banco (`databaseService.js` expõe o `pool` e `transaction`) |
| `middleware/` | CORS, tratamento de erro, autenticação (só onde necessário) |
| `routes/` | Vazia e reservada: as rotas `/api/*` ficam em `controllers/` |

Ver `src/controllers/authController.js` e `src/services/authService.js` como exemplo de estilo.

## Regras

- **Lógica de busca e distância fica no SQL.** Chame `buscar_residuos` e `pontos_proximos` com `pool.query("select * from buscar_residuos($1)", [q])`. Sempre com parâmetros (`$1`), nunca concatenando strings.
- Rotas de resíduos/pontos **não exigem login**.
- Erros: `{ "erro": "mensagem simples em português" }` com status correto. Nunca vazar stack trace.
- Busca sem resultado devolve `[]` com `200`.
- **Não logar nem guardar** `lat`/`lng` do usuário (o logger de `index.js` já imprime `originalUrl`; ao implementar pontos, considere omitir a query string).
- Credenciais só por variável de ambiente.

## Exemplo de rota (esqueleto)

```js
import { Router } from "express"
import pool from "../services/databaseService.js"

const router = Router()

router.get("/api/residuos", async (req, res) => {
    const q = String(req.query.q ?? "").trim()
    if (!q) return res.status(400).json({ erro: "Digite o que você quer descartar." })
    const { rows } = await pool.query("select * from buscar_residuos($1)", [q])
    res.json(rows)
})

export default router
```

Express 5 já repassa erros de handlers `async` ao middleware de erro; crie um middleware de erro final que responda `500` com `{ erro }`.

## CORS

Liberar apenas o domínio do front (variável `FRONT_URL`), mais `http://localhost:8000` em desenvolvimento. Responsável: Carlos.

## Geocodificação (Nominatim)

`GET https://nominatim.openstreetmap.org/search?q=...&format=json&limit=1&countrycodes=br` com header `User-Agent` identificando o app. Trate falha com `502` e mensagem simples (o front cai para o modo sem mapa).

## Fase 2: Bedrock

Somente em `POST /api/identificar-foto`, isolado em um service próprio. Se falhar, o resto da API não pode ser afetado. Credenciais AWS só no backend.

## Testar a API

Evidências da última rodada em [testes-api.md](testes-api.md).

**Opção 1: Postgres local no Docker.** O compose já carrega `migrations/` na primeira criação do volume (`init_db` e `02` a `06`).

```bash
docker compose up --build          # API na porta 8080
curl "http://localhost:8080/api/residuos?q=latinha"
# banco local antigo, sem as migrations novas: docker compose down -v && docker compose up --build  (apaga os dados locais)
```

**Opção 2: API local ligada ao Supabase.**

1. Crie um `.env` na raiz (já está no `.gitignore`; **nunca** commite). Use os dados de conexão do **banco**, não as chaves de API do Supabase:
   ```
   PORT=3000
   DB_HOST=aws-0-<região>.pooler.supabase.com
   DB_PORT=5432
   DB_USER=postgres.<id-do-projeto>
   DB_PASSWORD=...
   DB_NAME=postgres
   ```
2. `npm install` e depois `node --env-file=.env src/index.js` (o Node 22 lê o arquivo; não precisa de `dotenv`).
3. Teste com `curl` (porta 3000):
   ```bash
   curl "http://localhost:3000/api/categorias"
   curl "http://localhost:3000/api/residuos?q=pilah"
   curl "http://localhost:3000/api/residuos/2"
   curl "http://localhost:3000/api/residuos/2/pontos?lat=-8.283&lng=-35.970"
   ```

Para sobrescrever uma variável só no comando: `PORT=3000 node --env-file=.env src/index.js` (o que está no ambiente vence o arquivo).

## Aprendizados (problemas que já resolvemos)

- **Ordem no `src/index.js` importa.** `corsMiddleware` vem **antes** de `express.static` e das rotas; `rotaNaoEncontrada` depois de todas as rotas e `erroMiddleware` por último. Um CORS registrado só no arquivo, mas sem `app.use(corsMiddleware)`, não faz nada: já tivemos o item "CORS" marcado como pronto sem estar ligado.
- **Não logar localização (RNF07).** O logger usa `req.path`, não `req.originalUrl`, para a query string (`lat`/`lng`) não ir para o log.
- **Nominatim tem limite de uso** (1 requisição por segundo, `User-Agent` identificado). O `/api/geocodificar` guarda buscas repetidas por 10 minutos, espaça as chamadas em 1,1 s e responde `429` se a fila passar de 5 s. Não chame o Nominatim direto do front nem de outro controller.
- **Falha de serviço externo não derruba o fluxo.** Nominatim fora do ar vira `502` com mensagem simples, e o front cai para o modo sem mapa (RNF08).
- **Testar contra o banco real.** O endpoint de pontos já pode ser testado com o id de qualquer resíduo (até inativo), porque `pontos_proximos` só filtra o ponto. A busca por texto (`buscar_residuos`) só devolve resíduos ativos.
- Antes de dar um item de rota por concluído, confira na `main` (não só na branch) que a rota está registrada em `src/index.js`.

### Aprendizados das rotas de resíduos e pontos (02/10)

- **Não dá para usar as chaves de API do Supabase.** O backend fala com o banco por `pg` (`DB_*`). As chaves `anon` e `service_role` são de outro caminho (`supabase-js`) e **não são usadas**. Nunca use nem compartilhe a `service_role`: ela ignora o RLS.
- **Use o pooler do Supabase** (`...pooler.supabase.com`), com usuário `postgres.<id-do-projeto>`. A conexão direta (`db.<id>.supabase.co`) costuma ser só IPv6 e muita rede não alcança. Com o pooler, a conexão funcionou **sem configurar SSL** no `databaseService.js`.
- **`PORT` não é `DB_PORT`.** `PORT` é onde a API escuta; `DB_PORT` é a porta do Postgres (5432). Os dois iguais funcionam só se não houver Postgres local rodando na mesma máquina. Use `PORT=3000`.
- **Senha errada derruba a API inteira.** `password authentication failed` no arranque aparece antes de qualquer rota. Confira usuário (com o sufixo `.<id>`) e senha.
- **`Number("")` é `0`.** Valide `lat`/`lng` como texto não vazio **antes** de converter, senão `?lat=&lng=` vira a coordenada (0, 0). Veja `lerCoordenada` em `residuosController.js`. Rejeite também `Infinity`, fora de -90..90 e -180..180, e valor repetido na query (`?lat=1&lat=2` chega como array).
- **Valide o `:id` antes de ir ao banco.** Texto, `0`, negativo, decimal ou maior que `2147483647` (limite do `integer`) viram `404` na hora; sem isso o Postgres devolve erro e a API responde `500`.
- **Não vaze erro de banco.** Erro inesperado vira `500` com "Algo deu errado. Tente de novo em instantes." pelo `erroMiddleware`; o detalhe vai só para o log do servidor.
- **A rota de pontos confere o resíduo antes.** `pontos_proximos` não filtra resíduo inativo, então o controller checa `ativo` antes de chamar a função. Sem isso, um resíduo em rascunho teria pontos expostos.
- **Resíduo sem nenhum ponto** devolve `200` com `{ raio_usado: null, pontos: [] }`, não erro. O front precisa tratar `raio_usado: null`.
- **Não duplique a regra de distância em JS.** O controller só chama `buscar_residuos` e `pontos_proximos` com parâmetros `$1, $2, $3`.
- **Teste sem banco:** troque `pool.query` por uma função falsa num script e suba o `Router` num `express()` à parte. Serve para validar status e formato sem depender do Supabase.

### Bedrock: o que foi corrigido e o que falta (02/10, PR #27 na `main`)

- **Corrigido: a rota agora é `POST /api/identificar-foto`**, como no contrato (antes era `/classify`).
- **Corrigido: o Bedrock não derruba mais a API.** `wasteClassificationService.js` consultava o banco **no carregamento do módulo**; com o banco fora do ar ou a senha errada, o servidor nem subia, nem para as rotas de resíduos. Agora as categorias são lidas só quando a rota de foto é usada (com cache, e sem guardar a falha). Testado: com a senha do banco errada a API sobe, `/api/identificar-foto` responde, e só as rotas que usam o banco devolvem `500`.
- **Corrigido: o prompt do modelo listava as categorias como `[object Object]`.** Era `rows.join(", ")` sobre objetos `{ nome }`; agora lista os nomes.
- **Corrigido: os erros da rota de foto seguem o contrato** (`{ "erro": "..." }`): sem imagem = `400`, formato que não seja JPG/PNG/WebP = `400`, foto maior que 5 MB = `413`, campo com nome errado = `400` (o campo certo é `image`), falha da IA ou do banco = `500` genérico. Antes vinham como `{ message }` e o formato inválido virava `500`. Testado com `curl -F`.
- **Ainda diverge do contrato (não alterado):** o sucesso vem como `{ message, data: { type, recycle } }`, com a **categoria** em `type` e 3 ideias de artesanato, e não os ids de resíduos do banco. Definir com o Aldres e o Bernardo antes de o front consumir essa rota (ajustar o código ou o contrato). A orientação de descarte **sempre** vem do banco, nunca da IA.
- **Não testado:** a chamada real à AWS Bedrock (credenciais, região e `BEDROCK_MODEL_ID`). Os testes usaram um Bedrock falso; veja [testes-api.md](testes-api.md#rota-de-foto-post-apiidentificar-foto-bedrock-fase-2).

**Aprendizados dessa rota (valem para qualquer upload ou recurso opcional)**

- **Erros do `multer` não chegam ao seu handler.** Formato recusado no `fileFilter` e arquivo grande demais (`LIMIT_FILE_SIZE`) são lançados **antes** da rota e caem no `erroMiddleware` como `500`. Rode o `upload.single("image")` dentro de um middleware com callback (`receberImagem` em `wasteController.js`) e traduza: formato = `400`, tamanho = `413`, outros erros do `multer` = `400`, o resto segue para o `erroMiddleware`.
- **Marque o erro de formato com uma propriedade** (`formatoInvalido: true`) em vez de comparar o texto da mensagem.
- **Teste upload com `curl -F`**, que é o que o front fará: `curl -F "image=@foto.png;type=image/png" URL`. O `type=` importa, porque o filtro olha o `mimetype` que o cliente declara.
- **Recurso opcional não pode ter efeito colateral no carregamento do módulo.** Consulta ao banco, chamada de rede ou `await` no topo do arquivo derrubam o servidor inteiro se falharem. Faça só dentro da rota, com cache que **não guarda a falha**.
- **`array.join()` em objetos vira `[object Object]`.** Mapeie para o campo (`rows.map(l => l.nome)`) antes de montar um texto, principalmente em prompt de IA, onde o erro não aparece como exceção.
- **Todo erro de rota segue `{ "erro": "..." }`**, inclusive nas rotas opcionais. É o que o front espera (`js/api.js`).
- **Mocke o Bedrock na hora de testar:** troque `BedrockRuntimeClient.prototype.send` por uma função falsa. Dá para provar upload, prompt, cache e erros sem credenciais da AWS.
