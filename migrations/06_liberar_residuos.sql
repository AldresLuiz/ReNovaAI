-- Corrige os textos dos 9 resíduos do seed e libera todos (ativo = true), depois de
-- conferidos com fontes públicas oficiais (consultadas em 01/10/2026).
-- O 03 não foi editado: a correção entra aqui. Pode rodar mais de uma vez
-- (update pelo nome, dentro de begin/commit).

begin;

update residuos set
    orientacao_descarte = 'Esvazie a lata e leve a um ponto de coleta seletiva, a uma cooperativa de catadores ou a uma reciclagem. Não precisa tirar o lacre. A Prefeitura de Caruaru também faz coleta seletiva: (81) 98384-6721.',
    cuidados = null,
    nao_fazer = 'Não jogue na rua, em rios ou em terrenos. Não coloque guardanapo, bituca de cigarro ou resto de comida dentro da lata.',
    ativo = true
where nome = 'Lata de alumínio';

update residuos set
    orientacao_descarte = 'Guarde em um pote fechado e leve ao ponto de entrega mais próximo. Lojas que vendem pilhas são obrigadas a receber.',
    cuidados = 'Atenção: pilhas e baterias têm metais pesados (chumbo, cádmio e mercúrio) que contaminam o solo e a água. Guarde em um lugar seguro para não vazar.',
    nao_fazer = 'Não jogue no lixo comum, na rua ou em rios. Não queime.',
    ativo = true
where nome = 'Pilhas e baterias';

update residuos set
    orientacao_descarte = 'Esvazie a garrafa, lave, deixe secar e leve à coleta seletiva.',
    cuidados = null,
    nao_fazer = 'Não jogue em rios, ruas ou terrenos.',
    ativo = true
where nome = 'Garrafa PET';

update residuos set
    orientacao_descarte = 'Mantenha o papelão limpo e seco, abra e achate a caixa e leve à coleta seletiva.',
    cuidados = null,
    nao_fazer = 'Não coloque papelão molhado ou com gordura na coleta seletiva.',
    ativo = true
where nome = 'Papelão';

update residuos set
    orientacao_descarte = 'Esvazie a garrafa, lave e leve à coleta seletiva. Vidro quebrado também vai na coleta seletiva, bem embalado.',
    cuidados = 'Atenção: vidro quebrado corta. Embrulhe os cacos em jornal ou coloque em uma caixa de papelão ou garrafa PET fechada, e escreva "vidro quebrado" na embalagem.',
    nao_fazer = 'Não coloque cacos soltos em saco plástico nem misture com o lixo comum.',
    ativo = true
where nome = 'Garrafa de vidro';

update residuos set
    orientacao_descarte = 'Leve a um ponto de recebimento de lixo eletrônico, como os da Green Eletron ou da Abree.',
    cuidados = 'Atenção: celulares e eletrônicos têm bateria e metais pesados. O descarte errado pode causar incêndio, intoxicação e contaminação do solo e da água.',
    nao_fazer = 'Não jogue no lixo comum.',
    ativo = true
where nome = 'Celular e eletrônicos pequenos';

update residuos set
    orientacao_descarte = 'Espere o óleo esfriar, coloque em uma garrafa PET bem fechada e leve a um ponto de coleta de óleo.',
    cuidados = null,
    nao_fazer = 'Não jogue na pia, no ralo ou no vaso sanitário: o óleo entope o encanamento e polui rios.',
    ativo = true
where nome = 'Óleo de cozinha usado';

update residuos set
    orientacao_descarte = 'Leve a um ponto de recebimento de lâmpadas, como lojas que vendem lâmpadas. Guarde dentro de uma caixa ou sacola grossa para não quebrar.',
    cuidados = 'Atenção: lâmpada fluorescente tem mercúrio e outros componentes tóxicos. Cuide para não quebrar. Se quebrar, embale tudo com cuidado em uma caixa ou sacola grossa e leve ao ponto de recebimento.',
    nao_fazer = 'Não jogue no lixo comum.',
    ativo = true
where nome = 'Lâmpada fluorescente';

update residuos set
    orientacao_descarte = 'Leve a uma farmácia ou drogaria com ponto de coleta, ou ao posto de saúde. Se possível, mantenha o remédio na embalagem original.',
    cuidados = 'Atenção: remédio vencido pode causar intoxicação. Guarde longe de crianças e animais até a entrega.',
    nao_fazer = 'Não jogue na pia, no vaso sanitário nem no lixo comum.',
    ativo = true
where nome = 'Remédio vencido';

commit;
