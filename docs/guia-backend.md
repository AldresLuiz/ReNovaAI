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

## Testar

```bash
docker compose up --build
curl "http://localhost:8080/api/residuos?q=latinha"
```

## Aprendizados (problemas que já resolvemos)

- **Ordem no `src/index.js` importa.** `corsMiddleware` vem **antes** de `express.static` e das rotas; `rotaNaoEncontrada` depois de todas as rotas e `erroMiddleware` por último. Um CORS registrado só no arquivo, mas sem `app.use(corsMiddleware)`, não faz nada: já tivemos o item "CORS" marcado como pronto sem estar ligado.
- **Não logar localização (RNF07).** O logger usa `req.path`, não `req.originalUrl`, para a query string (`lat`/`lng`) não ir para o log.
- **Nominatim tem limite de uso** (1 requisição por segundo, `User-Agent` identificado). O `/api/geocodificar` guarda buscas repetidas por 10 minutos, espaça as chamadas em 1,1 s e responde `429` se a fila passar de 5 s. Não chame o Nominatim direto do front nem de outro controller.
- **Falha de serviço externo não derruba o fluxo.** Nominatim fora do ar vira `502` com mensagem simples, e o front cai para o modo sem mapa (RNF08).
- **Testar contra o banco real.** O endpoint de pontos já pode ser testado com o id de qualquer resíduo (até inativo), porque `pontos_proximos` só filtra o ponto. A busca por texto (`buscar_residuos`) só devolve resíduos ativos.
- Antes de dar um item de rota por concluído, confira na `main` (não só na branch) que a rota está registrada em `src/index.js`.
