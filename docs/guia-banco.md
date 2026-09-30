# Guia do banco de dados

Postgres 16 (local via docker-compose; Supabase em produção). Dono: Rafael.

## Arquivos

- `migrations/init_db.sql`: autenticação (existente).
- Sugestão: `migrations/02_schema_residuos.sql` (tabelas e funções) e `migrations/03_seed_residuos.sql` (dados). O compose executa a pasta em ordem alfabética **apenas na primeira criação do volume**. Para reaplicar: `docker compose down -v && docker compose up --build`.
- No Supabase, rodar os arquivos no SQL Editor.

## Extensões

```sql
create extension if not exists pg_trgm;
create extension if not exists unaccent;
```

## Tabelas

`categorias`, `residuos`, `sinonimos`, `pontos_coleta`, `ponto_residuo` (N:N), `configuracoes`. Colunas em [AGENTS.md](../AGENTS.md#6-modelo-de-dados). Em desenvolvimento o arquivo recria do zero (`drop table if exists ... cascade`).

## Funções

| Função | Regra |
| --- | --- |
| `buscar_residuos(q text, limite int default 8)` | Nome + sinônimos, sem acento/caixa, tolera erro de digitação (`pg_trgm`). Retorna `id, nome, categoria, similaridade` |
| `pontos_proximos(p_residuo, p_lat, p_lng)` | Só pontos ligados ao resíduo (RN01), ativos; raio 10 km → 25 km → mais próximo sem limite; retorna `distancia_km` e `raio_usado` |
| `distancia_km(lat1, lng1, lat2, lng2)` | Haversine |

Os raios vêm de `configuracoes` (`raio_inicial_km`, `raio_ampliado_km`).

## Testes rápidos

```sql
select * from buscar_residuos('latinha');
select * from buscar_residuos('pilah');
select * from pontos_proximos(1, -8.0100, -35.0100);
```

Esperado: "latinha" acha "Lata de alumínio"; "pilah" acha pilhas.

## Dados: o que exige cuidado

- **Não invente pontos de coleta.** O seed atual é fictício: marcar como exemplo e substituir por 10 a 15 pontos reais da região, com `verificado = true` só nos confirmados.
- Ajustar `ponto_residuo` para o que cada ponto realmente aceita.
- Orientações de descarte: conferir com fonte oficial (prefeitura, Ministério do Meio Ambiente), sobretudo **pilhas, lâmpadas e medicamentos**. Registrar a fonte (comentário no seed).
- Horário desconhecido: `null` (o front mostra "horário não disponível").
- Para todo resíduo com `risco = true`, preencher `cuidados`.
- Cadastre sinônimos populares ("latinha", "pilha", "garrafa pet", "óleo de cozinha"...).
