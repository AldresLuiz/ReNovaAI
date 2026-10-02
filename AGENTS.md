# ReNovaAI: contexto do projeto (leia antes de codar)

Projeto acadêmico do **Hackathon Unifavip Wyden**. Prazo: **sexta-feira, 02/10/2026** (início na quarta, 30/09/2026, ~2 dias de trabalho). Este arquivo reúne o que já foi decidido. Se algo aqui conflitar com um pedido na conversa, **pergunte antes de mudar uma decisão**.

Guias detalhados em [docs/](docs/README.md).

## 1. O que é

Site responsivo em que qualquer pessoa descobre, em poucos cliques, **como** e **onde** descartar corretamente um resíduo. Base: ODS 12 (Consumo e Produção Responsáveis), meta 12.5.

Público: população em geral, com atenção a **baixo letramento digital**: interface simples, palavras do dia a dia ("latinha", "pilha"), botões grandes, frases curtas, mobile primeiro.

**Fluxo central do MVP (não complicar):**

1. Informar o resíduo (busca por texto ou atalhos)
2. Ver como descartar (com cuidados e o que não fazer)
3. Encontrar o ponto de coleta mais próximo (lista + mapa + "Como chegar")

## 2. Time e responsabilidades

| Pessoa | Papel | Dono de |
| --- | --- | --- |
| Rafael | Backend, banco de dados | Schema, seed, funções SQL, pontos de coleta reais |
| Aldres | Backend, API de negócio e infraestrutura | Endpoints, AWS (Bedrock, credenciais), hospedagem e deploy (Render, Vercel) |
| Carlos | Backend, integração front e back | Contrato da API, consumo no front, CORS, tratamento de erro, modo sem mapa, teste do deploy |
| Bernardo | Frontend | Telas, mapa, "Como chegar", acessibilidade, mobile |

A divisão de infraestrutura (AWS/deploy com o Aldres; CORS/integração com o Carlos) é uma interpretação adotada; ajuste se o time combinar diferente.

## 3. Escopo do MVP

**Essencial:** pesquisa/seleção do resíduo; instruções de descarte com avisos de segurança primeiro; banco de resíduos com sinônimos; geolocalização e pontos compatíveis ordenados por distância; mapa.

**Importante:** botão "Como chegar" (abre a rota no app de mapas); busca por localização manual (bairro ou cidade).

**Fora do MVP (só slide de evolução):** painel administrativo completo (dados entram por seed), filtros avançados, feedback dos usuários, **identificação do resíduo por foto com IA**.

**IA não entra no caminho crítico.** A foto com IA (AWS Bedrock) é opcional, em rota própria; se falhar, o fluxo principal segue. A IA só **classifica** o resíduo; a orientação de descarte **sempre vem do banco**, nunca da IA.

## 4. Arquitetura e stack

```
Usuário → Frontend (HTML+CSS+JS puro, Vercel)
              │  REST/HTTPS
              ▼
          Backend API (Node + Express, Render) ──► Postgres (Supabase)
              │                     │
              │                     └─► AWS Bedrock (só /identificar-foto, opcional, fase 2)
              └─► Nominatim (geocodificação de bairro/cidade)
Frontend ──► Leaflet + OpenStreetMap (mapa, sem chave de API)
```

| Camada | Tecnologia | Observação |
| --- | --- | --- |
| Frontend | HTML + CSS + JavaScript puro, sem build | **Não introduzir React/Vite/bundler.** |
| Backend | Node + Express (ESM, `"type": "module"`) | Dockerizado; Postgres local via `docker-compose` |
| Banco | Postgres (Supabase em produção) | Extensões `pg_trgm` e `unaccent` |
| Mapa | Leaflet + OpenStreetMap | Sem cartão de crédito |
| Geocodificação | Nominatim | Bairro/cidade → lat/lng |
| Rota | Link do Google Maps com destino preenchido | `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG` |
| IA (fase 2) | AWS Bedrock (modelo de visão) | Só via `POST /api/identificar-foto`; credenciais só no backend |

**Decisões que não devem ser reabertas sem conversar com o time:**

- **Sem Redis.** Sem login de usuário final no MVP e poucas dezenas de registros.
- **Só o backend** fala com o banco e com a AWS (credenciais nunca vão ao navegador).
- **Bedrock é opcional** e isolado.
- **Front sem framework.**

### Estado atual do repositório

- O backend já tem **autenticação** (PR #1 do Aldres: `authController`, JWT, bcrypt, cookies). Ela **não faz parte do fluxo central do MVP**; não exija login nas rotas de resíduos/pontos.
- O acesso ao banco é via `pg` (`src/services/databaseService.js`), não `supabase.rpc`. Em produção, apontar as variáveis `DB_*` para o Supabase.
- O `docker-compose` carrega `migrations/` no Postgres **local** em ordem alfabética, só na primeira criação do volume. No Supabase, os arquivos são aplicados à mão no SQL Editor, um por vez, na ordem do número (veja [docs/guia-banco.md](docs/guia-banco.md)).

## 5. Estrutura de pastas

```
ReNovaAI/
├── AGENTS.md
├── src/                     backend
│   ├── controllers/         rotas /api/* e handlers Express (um Router por arquivo)
│   ├── datamodels/          (existente) DTOs/validação (zod)
│   ├── middleware/          (existente)
│   ├── services/            (existente) acesso ao banco e regras
│   ├── routes/              (vazia, reservada; as rotas ficam em controllers/)
│   └── index.js
├── migrations/              SQL executado pelo Postgres do compose
├── renovaai-front/          HTML + CSS + JS puro
│   ├── css/  js/
├── docs/                    guias e contrato da API
├── Dockerfile  docker-compose.yml  package.json  .env.example
```

## 6. Modelo de dados

Os arquivos de `migrations/` são seguros para produção: sem `drop`, em transação e repetíveis. Depois de aplicados, não se editam: mudança vira arquivo novo. Tabelas:

- `categorias(id, nome, icone)`
- `residuos(id, categoria_id, nome, orientacao_descarte, cuidados, nao_fazer, reciclavel, risco, ativo)`
- `sinonimos(id, residuo_id, termo)`
- `pontos_coleta(id, nome, endereco, lat, lng, horario, contato, verificado, ativo)`
- `ponto_residuo(ponto_id, residuo_id)`: N:N; garante que só aparece ponto que aceita o resíduo (RN01)
- `configuracoes(chave, valor)`: `raio_inicial_km` = 10, `raio_ampliado_km` = 25

Funções SQL (chamar do backend, **não reimplementar em JS**): `buscar_residuos(q, limite default 8)`, `pontos_proximos(p_residuo, p_lat, p_lng)` (retorna `distancia_km` e `raio_usado`: `inicial` | `ampliado` | `mais_proximo`), `distancia_km(lat1, lng1, lat2, lng2)`.

**Pendências de dados:** o seed (`03_seed_residuos.sql`) **não tem pontos de coleta**; os 10 a 15 reais entram em `05_seed_pontos_reais.sql`, com `verificado = true` só nos confirmados e `ponto_residuo` refletindo o que cada ponto aceita. Os resíduos do seed entram com `ativo = false` e texto `RASCUNHO:`; as orientações **precisam de fonte oficial** (prefeitura, Ministério do Meio Ambiente), sobretudo pilhas, lâmpadas e medicamentos, e só depois são liberadas (`ativo = true`).

## 7. Contrato da API (resumo; detalhes em [docs/contrato-api.md](docs/contrato-api.md))

Erros: status HTTP correto e `{ "erro": "mensagem em português simples" }`. Busca sem resultado devolve **lista vazia, não erro**. CORS liberado para o domínio do front.

| Rota | Uso |
| --- | --- |
| `GET /api/categorias` | Categorias da tela inicial |
| `GET /api/residuos?q=latinha` | Busca com sinônimos |
| `GET /api/residuos/:id` | Orientação de descarte |
| `GET /api/residuos/:id/pontos?lat=..&lng=..` | Pontos próximos que aceitam o resíduo |
| `GET /api/geocodificar?q=bairro` | Bairro/cidade → `{ lat, lng }` |
| `POST /api/identificar-foto` | Fase 2, só se sobrar tempo |

## 8. Frontend

Pasta `renovaai-front/`: `index.html` (busca e atalhos), `residuo.html` (`?id=8`), `css/style.css`, `js/config.js` (`USAR_MOCK`, `API_URL`), `js/api.js` (**único** lugar com chamadas ao backend), `js/mocks.js` (formato do contrato), `js/index.js`, `js/residuo.js`.

- Servir com servidor estático (`python3 -m http.server 8000`); módulos JS não abrem via `file://`.
- JS moderno (`type="module"`, `fetch`, `async/await`); texto do usuário sempre via `textContent` (nunca `innerHTML` com dados da API).
- O mapa Leaflet ainda **não foi validado** num navegador com internet.

## 9. Regras de negócio que afetam o código

- **RN01** só mostrar ponto que aceita o resíduo (garantido pela função SQL).
- **RN02/RN03** ordenar por distância; raio 10 km → 25 km → mais próximo. O front **explica** quando a busca foi ampliada (`raio_usado`).
- **RN05** horário vazio → "horário não disponível", nunca inventar.
- **RN06** resíduo não encontrado → mensagem clara e sugestões de busca.
- **RN07** sinônimos ("latinha" → "Lata de alumínio").
- **RN08** `risco = true` → **cuidados de segurança antes** da orientação.
- **RN10/RN11** localização opcional; sem permissão, oferecer bairro/cidade; a orientação nunca depende de localização.
- **RN12** `verificado = false` → "informação a confirmar".
- **RNF07** não armazenar a localização do usuário.
- **RNF08** se mapa ou serviço externo cair, endereço em texto e "Como chegar" continuam funcionando.

**Acessibilidade (RNF02/RNF03):** alto contraste, fonte grande, áreas de clique amplas, navegação por teclado, `label` em todo campo, não depender só de cor (usar texto como "Atenção:"), ícone sempre com texto, mobile primeiro.

## 10. Cronograma

- **Dia 1 manhã:** Rafael schema e seed · Aldres endpoints de busca e orientação · Carlos esqueleto da API e CORS · Bernardo telas com mocks · todos fecham schema e contrato na primeira hora.
- **Dia 1 tarde:** Rafael busca e distância testadas no SQL · Aldres banco e deploy · Carlos conecta front e back · Bernardo telas ligadas à API real.
- **Marco fim do dia 1:** busca e orientação ponta a ponta. Sem isso, o mapa não começa.
- **Dia 2 manhã:** Rafael pontos reais · Aldres pontos próximos e raio · Carlos geocodificação e modo sem mapa · Bernardo mapa, lista e "Como chegar".
- **Dia 2 tarde:** ajustes, acessibilidade, teste no celular, deploy final, testes ponta a ponta, ensaio.
- **Marco fim do dia 2:** demo completa no celular.

## 11. Checklist da demo

- [ ] Buscar "latinha" e chegar em "Lata de alumínio"
- [ ] Buscar "pilah" e ainda achar pilhas
- [ ] Cuidados de segurança antes da orientação de um resíduo de risco
- [ ] Pontos próximos no mapa com a distância
- [ ] Recusar a localização e buscar por bairro
- [ ] Abrir "Como chegar"
- [ ] Testar tudo no celular

## 12. Riscos e plano B

| Risco | Plano B |
| --- | --- |
| Poucos pontos reais | Cadastrar 10 a 15 na primeira manhã; `verificado` só nos confirmados |
| Front e back não se encontram | Contrato fechado no início; front usa mocks |
| Mapa/geocodificação fora do ar | Endereço em texto + "Como chegar" |
| Usuário nega localização | Campo de bairro/cidade |
| Bedrock atrasa ou falha | Foto vira slide de evolução |
| Deploy quebra perto da entrega | Deploy simples no fim do dia 1 |

## 13. Como trabalhar neste repositório

- Commits pequenos e frequentes; **uma branch por pessoa**.
- Mudança no contrato da API é avisada no grupo **antes** e atualizada em `docs/contrato-api.md` e `js/mocks.js`.
- Priorize o fluxo central sobre qualquer extra; o que não couber no prazo vira slide de evolução.
- **Não invente dados**: pontos, horários e orientações vêm do banco; o que for chute fica marcado como exemplo.
- **Sem credenciais no código nem no front**; use variáveis de ambiente no backend. (Atenção: o `.env.example` atual contém um `JWT_SECRET`; não reutilize em produção.)
- Ao terminar uma tarefa, diga o que foi feito e o que **não** foi testado.
- O andamento é acompanhado no Trello (https://trello.com/b/wgU7lkEn/renovaai-hackathon); regras em [docs/guia-trello.md](docs/guia-trello.md). Se o Trello divergir deste arquivo, **vale o repositório**.

## 14. Por pessoa (para o Claude Code de cada um)

- **Rafael:** `migrations/` (schema, seed), pontos reais, conferência das orientações, testes das funções SQL. Guia: [docs/guia-banco.md](docs/guia-banco.md).
- **Aldres:** endpoints da seção 7, conexão com o Supabase, AWS, Render, Vercel. Guias: [docs/guia-backend.md](docs/guia-backend.md), [docs/guia-deploy.md](docs/guia-deploy.md).
- **Carlos:** contrato, CORS, `js/api.js` com a API real, Nominatim, erros e modo sem mapa. Guias: [docs/contrato-api.md](docs/contrato-api.md), [docs/guia-backend.md](docs/guia-backend.md).
- **Bernardo:** `renovaai-front/`, Leaflet, "Como chegar", acessibilidade e mobile. Guia: [docs/guia-frontend.md](docs/guia-frontend.md).

## 15. Em aberto

- Cargo do Aldres e se "infraestrutura" inclui o deploy do front (assumido que sim).
- Região exata dos pontos de coleta (mock usa coordenadas fictícias perto de Caruaru-PE).
- API Express completa ou só chamadas às funções SQL (hoje o repo segue Express + `pg`).
- Se sobrar tempo: `POST /api/identificar-foto` com Bedrock.
