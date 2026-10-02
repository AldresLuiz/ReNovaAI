# Fontes dos pontos de coleta

De onde vêm os 14 pontos de [`migrations/05_seed_pontos_reais.sql`](../migrations/05_seed_pontos_reais.sql) e o que cada um aceita. Consulta feita em **01/10/2026**, para Caruaru-PE. Regra do projeto: nada de ponto, horário ou contato inventado.

> **Status de todos os pontos: `verificado = false`** (o site mostra "informação a confirmar"). Eles vêm de listas oficiais dos programas de logística reversa, mas **ninguém confirmou por telefone ou visita** que cada ponto funciona hoje. `horario` e `contato` ficam vazios porque nenhuma lista traz esses dados.

## Listas usadas

| Resíduo | Fonte | Tipo |
| --- | --- | --- |
| Pilhas e baterias | Localizador de pontos da **Green Eletron** | Entidade gestora da logística reversa |
| Celular e eletrônicos pequenos | Localizador de pontos da **Green Eletron** (também citada pelo [SINIR](https://sinir.gov.br/perfis/logistica-reversa/logistica-reversa/eletroeletronicos/), junto com a Abree) | Entidade gestora da logística reversa |
| Remédio vencido | Localizador de pontos da **LogMed** ([logmed.org.br](https://logmed.org.br/)) | Entidade gestora da logística reversa |
| Lâmpada fluorescente | Lista de pontos de entrega da **Reciclus** | Associação dos fabricantes (não é órgão público) |
| Lata, PET, papelão e vidro | **Prefeitura de Caruaru**, Ecoestação Indianópolis | Órgão público; veio da lista reunida pelo time |
| Óleo de cozinha usado | **Compesa**, programa "Mundo Limpo Vida Melhor" | Companhia estadual; fontes de 2017 e 2021 |

Os links diretos dos localizadores não estão aqui porque eles mudam e as listas foram copiadas das páginas. Para atualizar, volte ao localizador de cada programa e filtre por Caruaru.

## Os 14 pontos

| Ponto | Endereço | Aceita | Lista de origem |
| --- | --- | --- | --- |
| Drogasil, Universitário | Av. Brasil, s/n, Universitário | Pilhas, remédio | Green Eletron, LogMed |
| Drogasil, Petrópolis | R. Miguel de Sena, 360, Petrópolis | Pilhas, remédio | Green Eletron, LogMed |
| Drogasil, Maurício de Nassau | Av. Agamenon Magalhães, 982 | Pilhas, remédio | Green Eletron, LogMed |
| Drogasil, Frei Caneca | R. Frei Caneca, 26, Maurício de Nassau | Pilhas, remédio | Green Eletron, LogMed |
| Drogasil, Indianópolis | Av. Adjar da Silva Casé, 95 | Pilhas, remédio | Green Eletron, LogMed |
| Caruaru Shopping | Av. Adjar da Silva Casé, 800, Indianópolis | Pilhas, remédio, eletrônicos, lâmpada | Green Eletron, LogMed, Reciclus |
| Redepharma, Centro | Pç. Cel. João Guilherme, 16 | Remédio | LogMed |
| Assaí, Nossa Senhora das Dores | Av. Cleto Campelo, 9 | Pilhas, lâmpada | Green Eletron, Reciclus |
| Polo Comercial (Atacadão e Americanas) | BR-104, km 62, Nova Caruaru | Pilhas, lâmpada | Green Eletron, Reciclus |
| Ferreira Costa | Av. dos Estados, 129, Nova Caruaru | Pilhas, lâmpada | Green Eletron, Reciclus |
| Ecoestação Indianópolis | R. Manoel Nunes Filho, 600, Indianópolis | Lata, PET, papelão, vidro | Prefeitura de Caruaru |
| Compesa, loja de atendimento | R. Frei Caneca, 152, Maurício de Nassau (Estação Shopping) | Óleo de cozinha | Compesa |
| Casas Bahia, Centro | R. Vigário Freire, 32 | Pilhas, eletrônicos | Green Eletron |
| TIM, Maurício de Nassau | Av. Agamenon Magalhães, 444 | Eletrônicos, remédio | Green Eletron, LogMed |

Um mesmo endereço aparece em mais de uma lista (por exemplo, o Caruaru Shopping está em três). Por isso cruzamos as listas pelo **endereço** e ligamos cada ponto só ao que ele aparece aceitando.

## Como as coordenadas foram obtidas

- Cada coordenada foi **conferida no Google Maps** por Rafael (clique direito no pin, copiar `lat, lng`).
- A busca automática pelo OpenStreetMap/Nominatim serviu só como primeira tentativa e **errou**: a Compesa caiu em outra "Rua Cristóvão Colombo", em outro bairro, e a Reciclagem Radical caiu em terreno vazio. Os dois foram corrigidos ou descartados.
- A Drogasil de Indianópolis (Av. Adjar da Silva Casé, 95) e a Ecoestação (R. Manoel Nunes Filho, 600) tiveram o endereço e a coordenada passados diretamente por Rafael, a partir do Google Maps.

## Pontos ainda frágeis

- **Compesa (óleo):** a loja da Frei Caneca, 152 existe e funciona (Google Maps, "localizada em: Estação Shopping"), e uma notícia de [01/11/2021 da Rádio Cidade 99.7 FM](https://cidade997.com.br/tag/pontos-de-coleta/) citava a Loja de Atendimento da Estação Shopping como ponto de coleta de óleo. Um [comunicado da Compesa de 22/03/2017](https://servicos.compesa.com.br/compesa-amplia-parceria-com-a-asa-para-coleta-de-oleo-de-cozinha/) fala em coletores nas lojas, incluindo Caruaru. **Não há confirmação recente** de que o coletor ainda existe. Ligar para (81) 3366-2434 ou WhatsApp (81) 3366-2414. O horário de atendimento da loja (8h às 12h e 13h às 16h) é de atendimento ao cliente, **não** da coleta, por isso não foi gravado.
- **Ecoestação Indianópolis:** endereço e coordenada conferidos, mas o funcionamento e o horário não foram confirmados. Contato da coleta seletiva da Prefeitura: (81) 98384-6721.
- **Lâmpadas:** a fonte (Reciclus) é uma associação de fabricantes, não um órgão público.

## Pontos que ficaram de fora

- **Reciclagem Radical:** a coordenada caía em um terreno vazio. Confirmar pelo WhatsApp (81) 9 9176-7381 antes de incluir.
- **Drogasil da Av. José Rodrigues de Jesus:** não foi incluída.
- **Coleta de porta em porta** (coleta seletiva da Prefeitura): não é um ponto, e entra como texto na orientação da lata.
- **Óleo Sustentável e outros programas de óleo:** nenhum ponto em Caruaru nas listas consultadas.

## Como confirmar um ponto e atualizar

1. Ligue ou visite e anote o que for confirmado (funciona? aceita o quê? horário?).
2. Crie uma migration nova em `migrations/` (o `05` já foi aplicado e não se edita), por exemplo:
   ```sql
   update pontos_coleta set verificado = true, horario = 'seg a sex, 8h às 17h'
   where nome = 'Drogasil, Frei Caneca';
   ```
3. Se um ponto não existir mais: `update pontos_coleta set ativo = false where nome = '...';`
4. Atualize esta página com a data e a fonte da confirmação.
