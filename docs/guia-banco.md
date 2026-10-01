# Guia do banco de dados

Postgres 16 (local via docker-compose; Supabase em produção). Dono: Rafael.

## Arquivos

Em `migrations/`:

| Arquivo | Conteúdo |
| --- | --- |
| `init_db.sql` | Autenticação (tabela `users`) |
| `02_schema_residuos.sql` | Extensões, as 6 tabelas e RLS. Sem dados |
| `03_seed_residuos.sql` | Configurações, categorias, resíduos e sinônimos |
| `04_seed_pontos_reais.sql` | (a criar) Pontos de coleta reais |

Os arquivos são **seguros para produção**: não têm `drop`, rodam dentro de `begin/commit` e podem rodar de novo sem duplicar (`create ... if not exists` e `on conflict do nothing`). Depois de aplicado em produção, **não edite** um arquivo: qualquer mudança vira um arquivo novo com número maior (`05_...`).

### Como aplicar

- **Produção (Supabase):** no SQL Editor, rodar um arquivo por vez, na ordem do número. A pasta `migrations/` **não** roda sozinha lá.
- **Local (docker-compose):** o Postgres executa a pasta em ordem alfabética **apenas na primeira criação do volume**. Para reaplicar do zero: `docker compose down -v && docker compose up --build`. Isso apaga os dados locais.
- Ligar RLS também na tabela `users` do `init_db.sql` (guarda hash de senha): `alter table "users" enable row level security;`

## Extensões

No Supabase ficam no schema `extensions`:

```sql
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
```

Por isso, nas funções, chame `extensions.unaccent(...)` e `extensions.similarity(...)` (ou ajuste o `search_path`).

## Tabelas

`categorias`, `residuos`, `sinonimos`, `pontos_coleta`, `ponto_residuo` (N:N), `configuracoes`. Colunas em [AGENTS.md](../AGENTS.md#6-modelo-de-dados).

- Resíduo com `risco = true` **precisa** de `cuidados` preenchido (regra no banco, RN08).
- Todas têm **RLS ligado e sem policies**: a API pública do Supabase não enxerga nada; só o backend (conexão direta) acessa.

## Funções

| Função | Regra |
| --- | --- |
| `buscar_residuos(q text, limite int default 8)` | Nome + sinônimos, sem acento/caixa, tolera erro de digitação (`pg_trgm`). **Só resíduos com `ativo = true`.** Retorna `id, nome, categoria, similaridade` |
| `pontos_proximos(p_residuo, p_lat, p_lng)` | Só pontos ligados ao resíduo (RN01) e com `ativo = true`; raio 10 km → 25 km → mais próximo sem limite; retorna `distancia_km` e `raio_usado` |
| `distancia_km(lat1, lng1, lat2, lng2)` | Haversine |

Os raios vêm de `configuracoes` (`raio_inicial_km`, `raio_ampliado_km`).

## Testes rápidos

```sql
select * from buscar_residuos('latinha');
select * from buscar_residuos('pilah');
select * from pontos_proximos(1, -8.0100, -35.0100);
```

Esperado: "latinha" acha "Lata de alumínio"; "pilah" acha pilhas. Como o seed entra com os resíduos **inativos**, para testar é preciso ativar antes (veja abaixo).

## Dados: o que exige cuidado

- **Resíduos entram com `ativo = false` e texto `RASCUNHO:`.** Só aparecem para o público depois de conferidos com fonte oficial (prefeitura, Ministério do Meio Ambiente), sobretudo **pilhas, lâmpadas e medicamentos**. Para liberar: corrigir o texto (tirar o `RASCUNHO:`), registrar a fonte e rodar `update residuos set ativo = true where nome = '...';`. Como o `03` não se edita depois de aplicado, a correção entra num arquivo novo (ex.: `05_liberar_residuos.sql`).
- **O seed não tem pontos de coleta**, nem fictícios. **Não invente pontos.** Os 10 a 15 reais entram em `04_seed_pontos_reais.sql`, com `verificado = true` só nos confirmados e `on conflict (nome, endereco) do nothing`.
- `ponto_residuo` deve refletir o que cada ponto realmente aceita (não ligar tudo a tudo). Busque os ids pelo nome, sem fixar números.
- Horário desconhecido: `null` (o front mostra "horário não disponível").
- Para todo resíduo com `risco = true`, preencher `cuidados`.
- Cadastre sinônimos populares ("latinha", "pilha", "garrafa pet", "óleo de cozinha"...).
