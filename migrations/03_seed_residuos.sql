-- Dados iniciais: configurações, categorias, resíduos e sinônimos.
-- Pode rodar mais de uma vez (on conflict do nothing).

begin;

-- Raios de busca de pontos, em km (usados pela função pontos_proximos).
insert into configuracoes (chave, valor) values
   ('raio_inicial_km', 10),
   ('raio_ampliado_km', 25)
on conflict (chave) do nothing;

-- Categorias exibidas na tela inicial.
insert into categorias (nome, icone) values
    ('Metais', '🥫'),
    ('Pilhas e baterias', '🔋'),
    ('Plásticos', '🧴'),
    ('Papel e papelão', '📦'),
    ('Vidro', '🍾'),
    ('Eletrônicos', '📱'),
    ('Óleo de cozinha', '🛢️'),
    ('Lâmpadas', '💡'),
    ('Medicamentos', '💊')
on conflict (nome) do nothing;

-- Resíduos. A categoria é buscada pelo nome, sem fixar ids.
-- Colunas: categoria, nome, orientacao_descarte, cuidados, nao_fazer, reciclavel, risco, ativo.
insert into residuos
    (categoria_id, nome, orientacao_descarte, cuidados, nao_fazer, reciclavel, risco, ativo)
values
    ((select id from categorias where nome = 'Metais'),
     'Lata de alumínio',
     'RASCUNHO: enxágue a lata e leve a um ponto de coleta seletiva.',
     null,
     'RASCUNHO: não jogue no lixo comum.',
     true, false, false),

    ((select id from categorias where nome = 'Pilhas e baterias'),
     'Pilhas e baterias',
     'RASCUNHO: guarde em um pote fechado e entregue em um ponto de coleta especializado.',
     'RASCUNHO: contêm metais pesados. Não perfure, não queime e não abra.',
     'RASCUNHO: não jogue no lixo comum, na rua ou em rios.',
     false, true, false)
on conflict (nome) do nothing;

-- Palavras do dia a dia que levam ao resíduo.
insert into sinonimos (residuo_id, termo) values
    ((select id from residuos where nome = 'Lata de alumínio'), 'latinha'),
    ((select id from residuos where nome = 'Lata de alumínio'), 'lata de refrigerante'),
    ((select id from residuos where nome = 'Pilhas e baterias'), 'pilha'),
    ((select id from residuos where nome = 'Pilhas e baterias'), 'bateria')
on conflict (residuo_id, termo) do nothing;

commit; 