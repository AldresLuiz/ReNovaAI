# Documentação para devs

Comece pelo [AGENTS.md](../AGENTS.md) na raiz (escopo, decisões, regras de negócio).

| Guia | Para quem | Conteúdo |
| --- | --- | --- |
| [contrato-api.md](contrato-api.md) | Todos | Rotas, parâmetros, respostas e erros |
| [guia-backend.md](guia-backend.md) | Aldres, Carlos | Como criar rotas, padrões e CORS |
| [guia-banco.md](guia-banco.md) | Rafael | Schema, seed, funções SQL e dados reais |
| [fontes-pontos-coleta.md](fontes-pontos-coleta.md) | Rafael, todos | De onde vem cada ponto de coleta, o que ele aceita e como confirmar |
| [fontes-orientacoes.md](fontes-orientacoes.md) | Rafael, todos | De onde vem cada orientação de descarte (links, o que foi removido e o que falta conferir) |
| [testes-banco.md](testes-banco.md) | Rafael, Aldres | Evidências dos testes das funções SQL no Supabase (com imagens) |
| [testes-api.md](testes-api.md) | Todos | Relatório dos testes da API contra o Supabase real e o que ainda não foi testado |
| [guia-frontend.md](guia-frontend.md) | Bernardo, Carlos | Telas, mocks, mapa e acessibilidade |
| [guia-deploy.md](guia-deploy.md) | Aldres | Variáveis de ambiente, Render, Vercel, Supabase |
| [guia-git.md](guia-git.md) | Todos | Branches, commits e como avisar mudanças |
| [guia-trello.md](guia-trello.md) | Todos | Listas, etiquetas e fluxo do quadro do Trello |

## Rodar localmente

```bash
# backend + Postgres (porta 8080)
docker compose up --build

# frontend (outra aba)
cd renovaai-front && python3 -m http.server 8000
```
