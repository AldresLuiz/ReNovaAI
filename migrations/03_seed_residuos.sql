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
     false, true, false),

    ((select id from categorias where nome = 'Plásticos'),
     'Garrafa PET',
     'RASCUNHO: esvazie, enxágue e leve à coleta seletiva.',
     null,
     'RASCUNHO: não jogue em rios, ruas ou terrenos.',
     true, false, false),

    ((select id from categorias where nome = 'Papel e papelão'),
     'Papelão',
     'RASCUNHO: mantenha seco, desmonte a caixa e leve à coleta seletiva.',
     null,
     'RASCUNHO: não envie papelão molhado ou engordurado para reciclagem.',
     true, false, false),

    ((select id from categorias where nome = 'Vidro'),
     'Garrafa de vidro',
     'RASCUNHO: enxágue e leve à coleta seletiva.',
     'RASCUNHO: embale cacos em papel grosso ou caixa, para ninguém se cortar.',
     'RASCUNHO: não misture vidro quebrado no lixo sem proteção.',
     true, true, false),

    ((select id from categorias where nome = 'Eletrônicos'),
     'Celular e eletrônicos pequenos',
     'RASCUNHO: entregue em um ponto de coleta de lixo eletrônico.',
     'RASCUNHO: contêm bateria e metais pesados. Não desmonte nem queime.',
     'RASCUNHO: não jogue no lixo comum.',
     true, true, false),

    ((select id from categorias where nome = 'Óleo de cozinha'),
     'Óleo de cozinha usado',
     'RASCUNHO: espere esfriar, guarde em garrafa PET fechada e leve a um ponto de coleta de óleo.',
     null,
     'RASCUNHO: não jogue na pia, no vaso sanitário ou no ralo.',
     true, false, false),

    ((select id from categorias where nome = 'Lâmpadas'),
     'Lâmpada fluorescente',
     'RASCUNHO: guarde sem quebrar e entregue em um ponto de coleta especializado.',
     'RASCUNHO: contém mercúrio. Se quebrar, ventile o local e não aspire os cacos.',
     'RASCUNHO: não quebre e não jogue no lixo comum.',
     true, true, false),

    ((select id from categorias where nome = 'Medicamentos'),
     'Remédio vencido',
     'RASCUNHO: leve a uma farmácia ou posto de saúde que receba medicamentos vencidos.',
     'RASCUNHO: mantenha longe de crianças e animais até a entrega.',
     'RASCUNHO: não jogue na pia, no vaso sanitário ou no lixo comum.',
     false, true, false)
on conflict (nome) do nothing;

-- Palavras do dia a dia que levam ao resíduo.
insert into sinonimos (residuo_id, termo) values
    ((select id from residuos where nome = 'Lata de alumínio'), 'latinha'),
    ((select id from residuos where nome = 'Lata de alumínio'), 'lata de refrigerante'),
    ((select id from residuos where nome = 'Pilhas e baterias'), 'pilha'),
    ((select id from residuos where nome = 'Pilhas e baterias'), 'bateria'),
    ((select id from residuos where nome = 'Lata de alumínio'), 'lata de cerveja'),
    ((select id from residuos where nome = 'Garrafa PET'), 'garrafa de refrigerante'),
    ((select id from residuos where nome = 'Garrafa PET'), 'pet'),
    ((select id from residuos where nome = 'Papelão'), 'caixa de papelão'),
    ((select id from residuos where nome = 'Garrafa de vidro'), 'vidro'),
    ((select id from residuos where nome = 'Garrafa de vidro'), 'garrafa'),
    ((select id from residuos where nome = 'Celular e eletrônicos pequenos'), 'celular'),
    ((select id from residuos where nome = 'Celular e eletrônicos pequenos'), 'lixo eletrônico'),
    ((select id from residuos where nome = 'Óleo de cozinha usado'), 'óleo de fritura'),
    ((select id from residuos where nome = 'Óleo de cozinha usado'), 'óleo usado'),
    ((select id from residuos where nome = 'Lâmpada fluorescente'), 'lâmpada'),
    ((select id from residuos where nome = 'Remédio vencido'), 'remédio'),
    ((select id from residuos where nome = 'Remédio vencido'), 'medicamento')
on conflict (residuo_id, termo) do nothing;

commit; 