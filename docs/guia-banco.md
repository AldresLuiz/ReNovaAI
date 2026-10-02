# Guia do banco de dados

Postgres 16 (local via docker-compose; Supabase em produção). Dono: Rafael.

## Arquivos

Em `migrations/`:

| Arquivo | Conteúdo |
| --- | --- |
| `init_db.sql` | Autenticação (tabela `users`) |
| `02_schema_residuos.sql` | Extensões, as 6 tabelas e RLS. Sem dados |
| `03_seed_residuos.sql` | Configurações, categorias, resíduos e sinônimos |
| `04_funcoes_busca.sql` | Funções `distancia_km`, `buscar_residuos` e `pontos_proximos` |
| `05_seed_pontos_reais.sql` | 14 pontos de coleta reais de Caruaru-PE e 30 ligações ponto-resíduo |
| `06_liberar_residuos.sql` | Corrige os textos dos 9 resíduos com fonte oficial e os libera (`ativo = true`). Fontes em [fontes-orientacoes.md](fontes-orientacoes.md) |
| `07_...` | (a criar) Confirmações de pontos (`verificado = true`) e outras correções |

Os arquivos são **seguros para produção**: não têm `drop`, rodam dentro de `begin/commit` e podem rodar de novo sem duplicar (`create ... if not exists` e `on conflict do nothing`). Depois de aplicado em produção, **não edite** um arquivo: qualquer mudança vira um arquivo novo com número maior (`07_...`).

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

Por isso, as funções que usam `unaccent` e `similarity` declaram `set search_path = public, extensions` (veja `04_funcoes_busca.sql`).

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

Como `buscar_residuos` decide: o texto digitado é normalizado (sem acento, minúsculas); cada resíduo ganha a **maior** pontuação entre o nome e os sinônimos (1 se o texto contém o termo, senão a similaridade do `pg_trgm`); só entram pontuações a partir de **0,25** e termos com pelo menos 2 letras. Em `pontos_proximos`, quando nada está dentro de 25 km, `raio_usado = 'mais_proximo'` devolve **só o ponto mais perto**.

## Testes rápidos

```sql
select * from buscar_residuos('latinha');
select * from buscar_residuos('pilah');
select * from pontos_proximos(
  (select id from residuos where nome = 'Pilhas e baterias'),
  -8.2830, -35.9700   -- centro de Caruaru
);
```

Esperado: "latinha" acha "Lata de alumínio"; "pilah" acha pilhas; `pontos_proximos` de pilhas devolve 10 pontos ordenados por `distancia_km`, com `raio_usado = 'inicial'`. Como o seed entra com os resíduos **inativos**, as duas buscas por texto só funcionam depois de ativá-los (veja abaixo).

## Dados: o que exige cuidado

- **Resíduos entram no `03` com `ativo = false` e texto `RASCUNHO:`** e só aparecem para o público depois de conferidos com fonte oficial. Os 9 foram corrigidos e liberados pelo `06_liberar_residuos.sql`, com as fontes em [fontes-orientacoes.md](fontes-orientacoes.md). **Resíduo novo ou texto alterado segue o mesmo caminho:** corrigir o texto, registrar a fonte, e um arquivo novo com `update residuos set ... ativo = true where nome = '...';` (o `03` e o `06` não se editam depois de aplicados).
- **Pendente:** segunda conferência de **remédio vencido** e **lâmpada fluorescente** em fonte federal (as páginas do gov.br estavam bloqueadas na consulta).
- **O `03` não tem pontos de coleta**, nem fictícios. **Não invente pontos.** Os pontos reais estão em `05_seed_pontos_reais.sql` (14 pontos, 30 ligações), com `verificado = true` só nos confirmados e `on conflict (nome, endereco) do nothing`. **Hoje todos estão `verificado = false`.** Para confirmar um ponto depois de aplicado, crie um arquivo novo com `update pontos_coleta set verificado = true where nome = '...';` (não edite o `05`).
- **Pendência da Compesa:** a loja de atendimento (Rua Frei Caneca, 152) existe, mas falta confirmar que o coletor de óleo de cozinha continua lá (última notícia: 2021). Se não existir mais, o óleo fica sem ponto.
- **Ficaram de fora do `05`:** Reciclagem Radical (o pin caía em terreno vazio; confirmar pelo WhatsApp) e a Drogasil da Av. José Rodrigues de Jesus.
- `ponto_residuo` deve refletir o que cada ponto realmente aceita (não ligar tudo a tudo). Busque os ids pelo nome, sem fixar números.
- Horário desconhecido: `null` (o front mostra "horário não disponível").
- Para todo resíduo com `risco = true`, preencher `cuidados`.
- Cadastre sinônimos populares ("latinha", "pilha", "garrafa pet", "óleo de cozinha"...).

## Estado atual (02/10/2026)

- Aplicados no Supabase: `02`, `03`, `04`, `05` e `06`. Conferido: `pontos_coleta = 14`, `ponto_residuo = 30`, os 9 resíduos com `ativo = true` e `buscar_residuos` achando "latinha", "pilah" e "remédio" ([testes-banco.md](testes-banco.md)).
- A busca já encontra os 9 resíduos; o que falta para o site usar isso são os endpoints da API.
- `pontos_proximos` filtra o **ponto** ativo, mas não o resíduo: ela funciona pelo id do resíduo mesmo se ele estiver inativo.

## Aprendizados (problemas que já resolvemos)

**Escrever SQL**
- Erros de digitação que já aconteceram e o Postgres só avisa na hora de rodar: `begin`/`commit` faltando, `extension` em vez de `extensions`, nome de CTE diferente do usado depois, coluna com acento ou `_` trocado (`não_fazer` x `nao_fazer`), parênteses sem fechar. Antes de aplicar, releia o arquivo contra o schema do `02`.
- Em `pontos_proximos`, o texto do raio é `'mais_proximo'` (com `_`), igual ao documentado e ao que o front espera.
- Ao testar uma função, **não cole espaço reservado** (`<id de Pilhas e baterias>`). Busque o id na própria query: `pontos_proximos((select id from residuos where nome = 'Pilhas e baterias'), -8.2830, -35.9700)`.

**Aplicar no Supabase**
- Estar no repositório **não** significa estar no banco. Se `select * from pg_proc` não mostra a função, a migration não foi aplicada. Confira sempre depois de aplicar (contagens e uma chamada de teste).
- A ordem importa: `02` → `03` → `04` → `05`. O `05` depende dos resíduos do `03`.
- Os nomes usados em `ponto_residuo` do `05` precisam ser **idênticos** aos de `residuos.nome`. Se um nome divergir, a ligação some **sem erro**. Por isso a contagem esperada (30) é a conferência obrigatória.
- Linhas de teste (`[TESTE]...`) criadas para experimentar devem ser apagadas depois (`delete from pontos_coleta where nome like '[TESTE]%';`) e o `ativo` dos resíduos voltar a `false`.

**Dados de pontos de coleta**
- **Geocodificar endereço no OpenStreetMap errou** (a Compesa caiu em outra "Rua Cristóvão Colombo" em outro bairro; um pin caiu em terreno vazio). Confira **cada** coordenada no Google Maps antes de gravar.
- Um mesmo endereço pode abrigar vários resíduos (Drogasil, Caruaru Shopping, Assaí...). Cruze as listas dos programas (Green Eletron para pilhas e eletrônicos, LogMed para medicamentos, Reciclus para lâmpadas) pelo **endereço** e ligue cada ponto a tudo o que ele aceita nessas listas, e nada além.
- Coleta de porta em porta (coleta seletiva da Prefeitura, (81) 98384-6721) **não é ponto**. Ela vai como texto na orientação do resíduo.
- Todo dado sem confirmação entra com `verificado = false` e `horario`/`contato` nulos. Nunca preencha horário que não esteja na fonte (o horário de atendimento de uma loja não é o horário da coleta).
