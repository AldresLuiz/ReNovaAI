# Passagem Carlos: integração front e back

Estado da parte de integração (CORS, erros, geocodificação, ligação do front à API). Resume o que está escrito, o que **nunca foi executado** e o que ainda falta.

> **Aviso geral:** tudo o que está marcado como "escrito" foi feito sem rodar o projeto. Nenhum item abaixo foi testado em execução. Testar antes de confiar.

## 1. Resumo

| Item da integração | Situação |
| --- | --- |
| CORS | Escrito, **não testado** |
| Tratamento de erro (404 e 500 no formato do contrato) | Escrito, **não testado** |
| Rota `GET /api/geocodificar` (Nominatim) | Escrita, **não testada** |
| `express.json()` no `index.js` | Adicionado, **não testado** |
| Log sem localização do usuário (`req.path`) | Alterado, **não testado** |
| `js/api.js` ligado à API real | **Não iniciado** (a pasta `renovaai-front/` não foi revisada) |
| Modo sem mapa | **Não iniciado** |
| Teste de deploy e do fluxo no celular | **Não iniciado** |
| Confirmação do contrato com Aldres e Bernardo | **Não confirmada** |

## 2. O que está escrito

| Arquivo | O que faz |
| --- | --- |
| `src/middleware/corsMiddleware.js` | CORS à mão (o pacote `cors` não está no `package.json`). Libera `FRONT_URL` (produção), `http://localhost:8000` e `http://127.0.0.1:8000`. Responde ao pré-voo `OPTIONS` com `204` |
| `src/middleware/erroMiddleware.js` | `rotaNaoEncontrada` devolve `404` e `erroMiddleware` devolve `500`, ambos como `{ "erro": "..." }`. Não vaza stack trace |
| `src/controllers/geocodificarController.js` | `GET /api/geocodificar?q=bairro` chama o Nominatim e devolve `{ lat, lng }`. `400` sem texto ou texto acima de 100 caracteres, `404` se não achar, `502` se o Nominatim falhar ou demorar mais de 5 s |
| `src/index.js` | Registra o CORS e `express.json()` antes de tudo, o `geocodificarController` junto do `authController`, e `rotaNaoEncontrada` e `erroMiddleware` por último |

Sobre o `index.js`: se ele já tiver mudado, juntar à mão estas três coisas:

1. `app.use(corsMiddleware)` e `app.use(express.json())` no início, antes do `cookieParser`.
2. O log com `req.path` no lugar de `req.originalUrl`, para não gravar `lat`/`lng` (RNF07).
3. `app.use(rotaNaoEncontrada)` e depois `app.use(erroMiddleware)`, **depois de todas as rotas**, nessa ordem.

## 3. O que NÃO foi testado (e como testar)

Com `docker compose up --build` rodando:

```bash
# CORS e 404: esperado 404 com {"erro":"Rota não encontrada."} e o cabeçalho Access-Control-Allow-Origin
curl -i -H "Origin: http://localhost:8000" http://localhost:8080/api/qualquer

# Pré-voo: esperado 204 com Access-Control-Allow-Methods
curl -i -X OPTIONS -H "Origin: http://localhost:8000" http://localhost:8080/api/qualquer

# Origem não liberada: a resposta NÃO deve ter Access-Control-Allow-Origin
curl -i -H "Origin: http://site-qualquer.com" http://localhost:8080/api/qualquer

# Geocodificação: esperado {"lat": ..., "lng": ...}
curl "http://localhost:8080/api/geocodificar?q=Caruaru"

# Erros de entrada: esperado 400
curl -i "http://localhost:8080/api/geocodificar"

# Local inexistente: esperado 404
curl -i "http://localhost:8080/api/geocodificar?q=zzzxxxqqq"
```

Também verificar:

- O container tem acesso à internet e o Node é 18 ou mais novo (a rota usa `fetch` e `AbortSignal.timeout`). Se der `502` sempre, olhar estes dois pontos primeiro.
- O `502` do Nominatim mostra mensagem simples no front, e o front cai no modo sem mapa.
- O log do servidor não imprime `lat` e `lng` nas rotas de pontos.
- A rota de login/cadastro continua funcionando depois do `express.json()` (antes o `req.body` vinha vazio).

## 4. O que falta

### 4.1 `js/api.js` com a API real
- Nenhuma tela chama `fetch` direto, só funções do `api.js`.
- Funções necessárias: buscar resíduos, pegar resíduo, pegar pontos, geocodificar, todas com tratamento de erro.
- Em erro, ler `dados.erro` **e** `dados.error`: a autenticação devolve `error`, o contrato pede `erro`. O ideal é padronizar tudo em `erro`.
- Ao subir a API real: `USAR_MOCK = false`. Como o backend serve o front, `API_URL = ""` (mesma origem). Veja [guia-deploy.md](guia-deploy.md).
- O formato do mock em `js/mocks.js` precisa continuar igual ao de `docs/contrato-api.md`.

### 4.2 Modo sem mapa (RNF08)
- Se o Leaflet não carregar, ou a geocodificação devolver `502`: esconder o mapa e manter a **lista de pontos em texto**, com endereço e o botão "Como chegar".
- A lista de pontos precisa existir sempre; o mapa é só um extra por cima dela.
- O botão de busca por bairro dispara só no clique (o Nominatim aceita no máximo 1 requisição por segundo).

### 4.3 Deploy e teste ponta a ponta
- `FRONT_URL` só é necessária se o front estiver em **outro** domínio que o da API (aí é a URL desse front, sem barra no final); com o site servido pela API, não precisa.
- (O Render não é usado; o backend roda em Docker por SSH.)
- O pool em `databaseService.js` não configura SSL; no Supabase pode ser necessário `ssl: { rejectUnauthorized: false }`.
- Rodar o checklist da demo do `AGENTS.md` (seção 11) no celular.

### 4.4 Contrato da API
- Confirmar com Aldres e Bernardo que `docs/contrato-api.md` está fechado.
- Qualquer mudança: avisar o grupo antes e atualizar `docs/contrato-api.md` e `js/mocks.js` no mesmo PR.
- As rotas de resíduos e de pontos ainda não estavam implementadas no backend quando este arquivo foi escrito; só autenticação e geocodificação existiam.

## 5. O que não foi revisado

- A pasta `renovaai-front/` (HTMLs, `config.js`, `api.js`, `mocks.js`, `index.js`, `residuo.js`).
- O `Dockerfile` e o `.env.example`. Conferir no `.env.example` se `PORT=8080` (o compose expõe a 8080) e se `DB_HOST=postgres`, o nome do serviço no compose. Com `localhost` a conexão com o banco falha dentro do Docker.
- Os arquivos de `migrations/` (schema e seed).
- O Leaflet num navegador com internet (o `guia-frontend.md` também marca como não validado).
