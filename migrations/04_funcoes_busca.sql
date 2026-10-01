-- Funções de busca: distância, busca de resíduos e pontos próximos.
-- Repetível: create or replace function.

begin;

-- Distância em km entre dois pontos (fórmula de Haversine).
create or replace function distancia_km(
    lat1 double precision,
    lng1 double precision,
    lat2 double precision,
    lng2 double precision
)
returns double precision
language sql
immutable
as $$ 
  select 2 * 6371 * asin(sqrt(least(1,
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2))
    * power(sin(radians(lng2 - lng1) / 2), 2)
  )));
$$;

-- Busca resíduos pelo nome ou por sinônimos, ignorando acento e caixa e tolerando erro de digitação.
Create or replace function buscar_residuos(q text, limite integer default 8 )
returns table (id integer, nome text, categoria text, similaridade real)
language sql
stable
set search_path = public, extensions
as $$
  with busca as (
    select lower(unaccent(trim(q))) as termo
  ),
  textos as (
    select r.id as residuo_id, r.nome as texto
    from residuos r
    where r.ativo
    union all
    select s.residuo_id, s.termo
    from sinonimos s
    join residuos r on r.id = s.residuo_id
    where r.ativo
  ),
  pontuados as (
    select t.residuo_id,
    max(
        case 
           when lower(unaccent(t.texto)) like '%' || b.termo || '%' then 1
           else similarity(lower(unaccent(t.texto)), b.termo)
        end
    ) as pontos
    from textos t, busca b
    where length(b.termo) >=2
    group by t.residuo_id
  )

  select r.id, r.nome::text, c.nome::text, p.pontos::real
  from pontuados p
  join residuos r on r.id = p.residuo_id
  join categorias c on c.id = r.categoria_id
  where p.pontos >= 0.25
  order by p.pontos desc, r.nome
  limit limite;
  $$;

  -- Pontos que aceitam o resíduo, por distância: até 10 km, depois até 25 km, depois o mais próximo.
create or replace function pontos_proximos(
    p_residuo integer,
    p_lat double precision,
    p_lng double precision
)
returns table (
    id integer,
    nome text,
    endereco text,
    lat double precision,
    lng double precision,
    distancia_km double precision,
    horario text,
    contato text,
    verificado boolean,
    raio_usado text

)
language sql
stable
set search_path = public
as $$
    with raios as (
        select
            (select valor from configuracoes where chave = 'raio_inicial_km') as inicial,
            (select valor from configuracoes where chave = 'raio_ampliado_km') as ampliado
    ),
    candidatos as (
        select p.id, p.nome, p.endereco, p.lat, p.lng, p.horario, p.contato, p.verificado,
               distancia_km(p_lat, p_lng, p.lat, p.lng) as dist
        from pontos_coleta p 
        join ponto_residuo pr on pr.ponto_id = p.id
        where pr.residuo_id = p_residuo
          and p.ativo
    ),
    escolha as (
        select case
           when exists (select 1 from candidatos c, raios r where c.dist <= r.inicial) then 'inicial'
           when exists (select 1 from candidatos c, raios r where c.dist <= r.ampliado) then 'ampliado'
           else 'mais_proximo'
        end as raio
    )
    select c.id, c.nome::text, c.endereco::text, c.lat, c.lng, c.dist,
           c.horario::text, c.contato::text, c.verificado, e.raio
    from candidatos c, raios r, escolha e
    where (e.raio = 'inicial' and c.dist <= r.inicial)
       or (e.raio = 'ampliado' and c.dist <= r.ampliado)
       or (e.raio = 'mais_proximo' and c.dist = (select min(dist) from candidatos))
    order by c.dist;
$$;

commit;
