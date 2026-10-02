# Guia de deploy e infraestrutura

Dono: Aldres. Estado verificado em **02/10/2026** (o que não foi confirmado está marcado).

## Como está no ar hoje

| Peça | Como | Observação |
| --- | --- | --- |
| **Backend + front** | Docker num servidor próprio, por SSH. O backend (Express) **serve o front estático** (`express.static` em `renovaai-front/`) e a API **no mesmo domínio** | Segundo o Aldres: "o site tá sendo servido pela API". Por isso `API_URL = ""` (mesma origem) |
| **Deploy** | Workflow manual `.github/workflows/deploy.yml` (`workflow_dispatch`): entra por SSH, `git pull origin main`, `docker compose down` e `docker compose up --build -d` | **Não é automático.** Só chega ao ar o que foi mergeado na `main` **e** teve o workflow rodado. Os dados do servidor (`SSH_HOST` etc.) estão nos `secrets` do GitHub |
| **Banco** | Supabase (Postgres), pelo pooler | Migrations aplicadas **à mão** no SQL Editor |
| **Vercel** (`renovaai-demo.vercel.app`) | Serve um front estático e repassa `/api/*` para o backend (esse redirecionamento **não está no repositório**: não há `vercel.json`) | **Em 02/10 o front da Vercel estava desatualizado** (veja abaixo) |
| IA (fase 2) | AWS Bedrock | Só em `POST /api/identificar-foto`; nunca testada com credenciais reais |

> **Render:** aparece em textos antigos do projeto, mas **não há configuração do Render** no repositório. Não é usado.

### O que não está confirmado
- O **domínio público do backend** (o que serve o site e a API) e se ele tem HTTPS: só o Aldres sabe, não está no repositório.
- Que o backend em produção usa os `DB_*` do **Supabase** (confirmado por Rafael e pelo Aldres, mas não verificável pelo repositório). O `docker-compose.yml` também sobe um **Postgres local** e lê as variáveis de `.env.example`, que apontam para ele; no servidor, as variáveis de produção precisam sobrescrever isso.
- Como e quando a Vercel publica (git integration ou deploy manual).

## O front da Vercel em 02/10 (verificado por fora)

Testei `https://renovaai-demo.vercel.app` com `curl`:

- **A API responde certo por esse domínio**, com dados do Supabase e com o código mais recente do backend (a rota nova `/api/identificar-foto` responde e a antiga `/classify` dá 404).
- **O front servido ali é o do dia 01/10**: `config.js` com `USAR_MOCK = true` e `API_URL = "http://localhost:3000"`. Ele **nunca chama a API** e mostra os dados de exemplo (`mocks.js`), com pontos fictícios. Nenhum dos commits de 02/10 do Bernardo (mapa, localização, pontos, `API_URL = ""`) chegou lá.
- **Consequência:** quem abrir esse link na demo vê dados inventados. Defina **um** link oficial da demo. Se for o da Vercel, ela precisa publicar o front atual da `main`; com `API_URL = ""` e o redirecionamento de `/api/*` que já existe, deve funcionar (confirmar depois do deploy).

Para investigar no painel da Vercel: Deployments (qual commit está publicado e se houve erro de build), Settings (branch de produção e diretório raiz `renovaai-front`) e o redirecionamento de `/api/*`.

## Variáveis de ambiente (backend)

| Variável | Uso |
| --- | --- |
| `PORT` | Porta em que a **API** escuta (no compose, 8080). Não é a do Postgres |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | Conexão com o Postgres. Em produção, o **pooler do Supabase** (`...pooler.supabase.com`, usuário `postgres.<id-do-projeto>`, porta 5432) |
| `JWT_SECRET` | Autenticação. **Gerar um novo para produção**; o valor do `.env.example` é público no repositório |
| `FRONT_URL` | Origem liberada no CORS. Só importa se o front estiver em **outro** domínio; com o site servido pela API (mesma origem) não é necessária |
| `AWS_REGION` `BEDROCK_MODEL_ID` `AWS_ACCESS_KEY_ID` `AWS_SECRET_ACCESS_KEY` | Somente fase 2 (no `.env.example`, as chaves estão vazias) |

Chaves de API do Supabase (`anon`, `service_role`) **não** são usadas. **Nunca** commite `.env` ou chaves.

## Publicar uma mudança (checklist)

1. Mergear na `main`.
2. Se mudou o **banco**: aplicar a migration **à mão** no SQL Editor do Supabase, na ordem, e conferir (contagens e uma chamada de função; veja [testes-banco.md](testes-banco.md)).
3. Rodar o workflow **Deploy** no GitHub (Actions) e esperar terminar. Se o front estiver na Vercel, conferir que ela publicou o commit novo.
4. Testar **no domínio público**, não só local:
   ```bash
   curl "https://<dominio>/api/residuos?q=latinha"          # Lata de alumínio
   curl "https://<dominio>/api/residuos/2/pontos?lat=-8.283&lng=-35.97"
   curl "https://<dominio>/js/config.js"                    # USAR_MOCK deve ser false
   ```
5. Abrir o site no **celular** e rodar o checklist da demo de [AGENTS.md](../AGENTS.md#11-checklist-da-demo).

## Atenções

- **Deploy manual:** esquecer o passo 3 deixa o site no ar com a versão antiga. Em 02/10, a `main` já tinha o front integrado, e o front da Vercel não.
- **HTTPS:** o navegador bloqueia chamadas `http://` feitas por uma página `https://`. Se o front e a API estiverem em domínios diferentes, a API precisa de HTTPS.
- **Primeiro acesso depois de um deploy:** a API reinicia; espere alguns segundos antes de testar.
- **Busca por bairro:** o Nominatim cobre mal os bairros de Caruaru. Veja [testes-api.md](testes-api.md#geocodificação-de-bairros-de-caruaru).

## Aprendizados (problemas que já resolvemos)

- **Aplicar migration não é automático no Supabase.** O Supabase só roda o que alguém colar no SQL Editor, um arquivo por vez, na ordem do número (`02` → `03` → `04` → `05` → `06`). Depois de cada migration, confira o resultado: `pontos_coleta = 14`, `ponto_residuo = 30`, os 9 resíduos com `ativo = true` e uma chamada de função.
- **RLS:** as 7 tabelas do schema `public` (as 6 do `02` e a `users`) estão com RLS ligado, sem policies; confirmado por consulta em 02/10.
- **Conexão com o Supabase:** use o **pooler**. Num teste local, a conexão funcionou **sem SSL** no `databaseService.js`; se falhar no servidor de produção, ajustar o pool (`ssl`) antes de procurar outro problema. A conexão direta (`db.<id>.supabase.co`) costuma ser só IPv6.
- **`PORT` não é `DB_PORT`.** Os dois iguais funcionam só se não houver Postgres local na mesma máquina.
- **Bedrock isolado:** a consulta ao banco do módulo de foto só roda quando a rota `/api/identificar-foto` é usada; um banco fora do ar não impede a API de subir (veja [guia-backend.md](guia-backend.md#bedrock-o-que-foi-corrigido-e-o-que-falta-0210)).
- **Segredos:** o `JWT_SECRET` do `.env.example` é público; gerar outro para produção. Nada de chaves no código nem no front.
- **Teste de produção por fora é possível:** `curl` no domínio público mostra se o front no ar é o certo (`/js/config.js`) e se a API responde, sem acesso ao servidor.
