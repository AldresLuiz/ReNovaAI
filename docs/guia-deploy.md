# Guia de deploy e infraestrutura

Dono: Aldres. Deploy simples no **fim do dia 1**; ajustes no dia 2.

| Peça | Serviço |
| --- | --- |
| Frontend | Vercel (pasta `renovaai-front/`, site estático, sem build) |
| Backend | Render (Dockerfile na raiz, porta `PORT`) |
| Banco | Supabase (Postgres) |
| IA (fase 2) | AWS Bedrock |

## Variáveis de ambiente (backend)

| Variável | Uso |
| --- | --- |
| `PORT` | Porta do Express |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | Conexão com o Postgres (Supabase em produção; pode exigir SSL) |
| `JWT_SECRET` | Autenticação. **Gerar um novo para produção**; o valor do `.env.example` é público no repositório |
| `FRONT_URL` | Origem liberada no CORS |
| `AWS_*` | Somente fase 2 |

Configure no painel do Render; **nunca** commite `.env` ou chaves (Supabase service key, AWS).

## Passo a passo

1. **Supabase:** criar projeto, habilitar `pg_trgm` e `unaccent`, rodar os SQL de `migrations/` no SQL Editor, testar as funções.
2. **Render:** Web Service a partir do repositório (Docker), configurar variáveis, testar `GET /api/categorias`.
3. **Vercel:** apontar para `renovaai-front/`, ajustar `API_URL` para a URL do Render e `USAR_MOCK = false`.
4. Colocar a URL da Vercel em `FRONT_URL` no Render (CORS).
5. Carlos testa o fluxo no celular.

## Atenções

- Plano gratuito do Render "dorme": abra o backend antes da demo.
- O pool em `databaseService.js` hoje não configura SSL; ajustar para o Supabase se necessário.
- Antes de cada demo, rodar o checklist de [AGENTS.md](../AGENTS.md#11-checklist-da-demo).

## Aprendizados (problemas que já resolvemos)

- **Aplicar migration não é automático no Supabase.** O Supabase só roda o que alguém colar no SQL Editor, um arquivo por vez, na ordem do número (`02` → `03` → `04` → `05`). Depois de cada deploy do banco, confira as contagens (`pontos_coleta = 14`, `ponto_residuo = 30`) e uma chamada de função.
- **RLS:** as 6 tabelas do `02` já têm RLS ligado, sem policies. Falta confirmar com o Aldres o RLS na tabela `users` do `init_db.sql` (guarda hash de senha).
- **Conexão com o Supabase:** o `databaseService.js` não configura SSL. Se a conexão falhar em produção, ajustar o pool (`ssl`) antes de procurar outro problema.
- **Segredos:** o `JWT_SECRET` do `.env.example` é público; gerar outro para produção. Nada de chaves no código nem no front.
- **Antes da demo:** abrir o backend (plano gratuito dorme) e rodar o checklist de [AGENTS.md](../AGENTS.md#11-checklist-da-demo).
