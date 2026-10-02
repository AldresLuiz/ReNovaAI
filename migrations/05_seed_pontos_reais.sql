-- Pontos de coleta reais de Caruaru-PE e o que cada um aceita.
--
-- Fontes das listas de pontos (consultadas em 01/10/2026):
--   pilhas e eletrônicos: Green Eletron (localizador)
--   medicamentos:         LogMed (localizador)
--   lâmpadas:             Reciclus (lista de pontos de entrega)
--   óleo de cozinha:      Compesa (programa "Mundo Limpo Vida Melhor")
--   recicláveis:          Prefeitura de Caruaru (Ecoestação Indianópolis)
-- As coordenadas foram conferidas no Google Maps.
--
-- Todos entram com verificado = false: o funcionamento ainda precisa ser confirmado
-- (o site mostra "informação a confirmar"). horario e contato ficam vazios de propósito:
-- nenhuma das listas traz esses dados e eles não podem ser inventados.
--
-- Pode rodar mais de uma vez (on conflict do nothing). Os nomes usados nas ligações
-- precisam ser idênticos aos cadastrados: se um nome divergir, a ligação some sem erro.
-- Depois de aplicar, conferir: pontos_coleta = 14 e ponto_residuo = 30.

begin;

insert into pontos_coleta (nome, endereco, lat, lng) values
    ('Drogasil, Universitário', 'Avenida Brasil, s/n, Universitário, Caruaru-PE', -8.273201, -35.963777),
    ('Drogasil, Petrópolis', 'Rua Miguel de Sena, 360, Petrópolis, Caruaru-PE', -8.295988, -35.973012),
    ('Drogasil, Maurício de Nassau', 'Avenida Agamenon Magalhães, 982, Maurício de Nassau, Caruaru-PE', -8.273908, -35.973870),
    ('Drogasil, Frei Caneca', 'Rua Frei Caneca, 26, Maurício de Nassau, Caruaru-PE', -8.282583, -35.968655),
    ('Drogasil, Indianópolis', 'Avenida Adjar da Silva Casé, 95, Indianópolis, Caruaru-PE', -8.292123, -35.950499),
    ('Caruaru Shopping', 'Avenida Adjar da Silva Casé, 800, Indianópolis, Caruaru-PE', -8.295245, -35.951867),
    ('Redepharma, Centro', 'Praça Coronel João Guilherme, 16, Nossa Senhora das Dores, Caruaru-PE', -8.286017, -35.969921),
    ('Assaí, Nossa Senhora das Dores', 'Avenida Cleto Campelo, 9, Nossa Senhora das Dores, Caruaru-PE', -8.283174, -35.966890),
    ('Polo Comercial (Atacadão e Americanas)', 'Rodovia BR-104, km 62, Nova Caruaru, Caruaru-PE', -8.237491, -35.976618),
    ('Ferreira Costa', 'Avenida dos Estados, 129, Nova Caruaru, Caruaru-PE', -8.265486, -35.979048),
    ('Ecoestação Indianópolis', 'Rua Manoel Nunes Filho, 600, Indianópolis, Caruaru-PE', -8.288877, -35.951263),
    ('Compesa, loja de atendimento', 'Rua Frei Caneca, 152, Maurício de Nassau, Caruaru-PE', -8.282119, -35.970209),
    ('Casas Bahia, Centro', 'Rua Vigário Freire, 32, Nossa Senhora das Dores, Caruaru-PE', -8.285303, -35.969710),
    ('TIM, Maurício de Nassau', 'Avenida Agamenon Magalhães, 444, Maurício de Nassau, Caruaru-PE', -8.277662, -35.971705)
on conflict (nome, endereco) do nothing;

-- O que cada ponto aceita (RN01). Ponto e resíduo são buscados pelo nome, sem fixar ids.
insert into ponto_residuo (ponto_id, residuo_id)
select p.id, r.id
from (values
    ('Drogasil, Universitário', 'Pilhas e baterias'),
    ('Drogasil, Universitário', 'Remédio vencido'),
    ('Drogasil, Petrópolis', 'Pilhas e baterias'),
    ('Drogasil, Petrópolis', 'Remédio vencido'),
    ('Drogasil, Maurício de Nassau', 'Pilhas e baterias'),
    ('Drogasil, Maurício de Nassau', 'Remédio vencido'),
    ('Drogasil, Frei Caneca', 'Pilhas e baterias'),
    ('Drogasil, Frei Caneca', 'Remédio vencido'),
    ('Drogasil, Indianópolis', 'Pilhas e baterias'),
    ('Drogasil, Indianópolis', 'Remédio vencido'),
    ('Caruaru Shopping', 'Pilhas e baterias'),
    ('Caruaru Shopping', 'Remédio vencido'),
    ('Caruaru Shopping', 'Celular e eletrônicos pequenos'),
    ('Caruaru Shopping', 'Lâmpada fluorescente'),
    ('Redepharma, Centro', 'Remédio vencido'),
    ('Assaí, Nossa Senhora das Dores', 'Pilhas e baterias'),
    ('Assaí, Nossa Senhora das Dores', 'Lâmpada fluorescente'),
    ('Polo Comercial (Atacadão e Americanas)', 'Pilhas e baterias'),
    ('Polo Comercial (Atacadão e Americanas)', 'Lâmpada fluorescente'),
    ('Ferreira Costa', 'Pilhas e baterias'),
    ('Ferreira Costa', 'Lâmpada fluorescente'),
    ('Ecoestação Indianópolis', 'Lata de alumínio'),
    ('Ecoestação Indianópolis', 'Garrafa PET'),
    ('Ecoestação Indianópolis', 'Papelão'),
    ('Ecoestação Indianópolis', 'Garrafa de vidro'),
    ('Compesa, loja de atendimento', 'Óleo de cozinha usado'),
    ('Casas Bahia, Centro', 'Pilhas e baterias'),
    ('Casas Bahia, Centro', 'Celular e eletrônicos pequenos'),
    ('TIM, Maurício de Nassau', 'Celular e eletrônicos pequenos'),
    ('TIM, Maurício de Nassau', 'Remédio vencido')
) as v(ponto, residuo)
join pontos_coleta p on p.nome = v.ponto
join residuos r on r.nome = v.residuo
on conflict (ponto_id, residuo_id) do nothing;

commit;
