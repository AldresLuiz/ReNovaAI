# Fontes das orientações de descarte

De onde vêm os textos de `orientacao_descarte`, `cuidados` e `nao_fazer` dos 9 resíduos, liberados em [`migrations/06_liberar_residuos.sql`](../migrations/06_liberar_residuos.sql). Consulta feita em **01/10/2026**. Regra do projeto: a orientação vem do banco e precisa ter fonte (nunca da IA).

> **Limite desta conferência.** As páginas federais do gov.br sobre medicamentos, lâmpadas e separação do lixo apareceram como "conteúdo restrito" e não puderam ser lidas. Por isso várias fontes abaixo são de governos estaduais e municipais. Antes da apresentação, vale uma segunda conferência, principalmente de **remédio vencido** e **lâmpada fluorescente**.

## Lata de alumínio

- [SINIR: latas de alumínio para bebidas](https://sinir.gov.br/perfis/logistica-reversa/logistica-reversa/latas-de-aluminio-para-bebidas/) (governo federal)
- Dá respaldo a: entregar em recicladoras, cooperativas, centros de recebimento e pontos de entrega voluntária; nunca jogar em vias públicas, cursos de água ou solo; não tirar o lacre; não colocar alimento, guardanapo ou bituca dentro.
- Telefone da coleta seletiva da Prefeitura de Caruaru, (81) 98384-6721: veio da lista de pontos do time e foi confirmado por Rafael.
- **Removido do rascunho:** "enxágue a lata". A fonte não manda enxaguar.

## Pilhas e baterias

- [SINIR: pilhas e baterias](https://sinir.gov.br/perfis/logistica-reversa/logistica-reversa/pilhas-e-baterias/)
- [Resolução CONAMA 257/1999](https://www.ibama.gov.br/sophia/cnia/legislacao/MMA/RE0257-300699.PDF)
- [IBAMA, Instrução Normativa 8/2012](https://www.ibama.gov.br/component/legislacao/?view=legislacao&legislacao=127860)
- Também a Resolução CONAMA 401/2008 (limites de chumbo, cádmio e mercúrio).
- Dá respaldo a: levar ao ponto de entrega mais próximo; o comércio que vende é obrigado a receber; não descartar a céu aberto nem queimar; guardar para não vazar; risco de contaminação por chumbo, cádmio e mercúrio.
- **Removido do rascunho:** "não perfure e não abra". Nenhuma fonte oficial consultada traz isso.

## Celular e eletrônicos pequenos

- [SINIR: eletroeletrônicos](https://sinir.gov.br/perfis/logistica-reversa/logistica-reversa/eletroeletronicos/)
- Dá respaldo a: entregar em pontos de recebimento (Abree ou Green Eletron); o descarte errado pode causar incêndio, intoxicação e contaminação do solo e da água por metais pesados.
- **Removido do rascunho:** "não desmonte". A fonte não traz isso.

## Lâmpada fluorescente

- [Resolução CONSEMA-RS 333/2016](https://www.sema.rs.gov.br/upload/arquivos/201612/23082758-333-2016-logistica-reversa-lampadas-florescentes.pdf)
- [Prefeitura de Canoas: lâmpadas fluorescentes](https://www.canoas.rs.gov.br/lampadas-fluorescentes-de-vapor-de-sodio-e-mercurio-e-de-luz-mista/)
- Dá respaldo a: devolver no comércio, em caixa ou sacola grossa para não quebrar; contém mercúrio e outros componentes tóxicos; não vai na coleta comum; se quebrar, embalar e levar ao ponto.
- **Removido do rascunho:** "ventile o local e não aspire os cacos". Nenhuma fonte consultada traz isso.
- A página do MMA sobre lâmpadas estava restrita; a Reciclus (associação dos fabricantes, não é fonte oficial) foi usada só para os pontos de entrega.

## Remédio vencido

- Decreto 10.388/2020: farmácias e drogarias mantêm ponto de recebimento.
- [Agência SP: medicamentos vencidos, onde descartar](https://www.agenciasp.sp.gov.br/medicamentos-vencidos-onde-descartar-e-por-que-nao-jogar-no-lixo-ou-no-vaso-sanitario/)
- [Cofen: medicamentos não devem ser descartados em lixos comuns](https://www.cofen.gov.br/medicamentos-nao-devem-ser-descartados-em-lixos-comuns/)
- Dá respaldo a: levar a farmácia, drogaria ou posto de saúde; manter na embalagem original quando possível; não jogar na pia, no vaso nem no lixo comum.
- **Sem fonte específica:** "guarde longe de crianças e animais até a entrega". É cuidado de bom senso, mantido porque o campo `cuidados` é obrigatório para resíduo de risco.

## Óleo de cozinha usado

- [Agência Brasília (GDF): como descartar óleo de cozinha e azeite](https://www.agenciabrasilia.df.gov.br/w/saiba-como-descartar-oleo-de-cozinha-e-azeite-sem-poluir-o-meio-ambiente)
- [SEDEST-PR: coleta de óleo de cozinha](https://www.sedest.pr.gov.br/Pagina/Coleta-de-oleo-de-cozinha-0)
- Dá respaldo a: esperar esfriar; colocar em garrafa PET bem fechada; levar a um ponto de coleta; não jogar na pia ou no ralo (entope a tubulação e polui rios e mananciais).
- Os pontos de Caruaru (loja da Compesa) estão em [guia-banco.md](guia-banco.md); a existência atual do coletor ainda precisa ser confirmada.

## Garrafa PET e Papelão

- [Prefeitura de Umuarama: separar recicláveis para a coleta seletiva](https://www.umuarama.pr.gov.br/noticias/meio-ambiente/populao-precisa-separar-reciclveis-para-a-coleta-seletiva)
- [Prefeitura de Sapiranga: como descartar cada tipo de resíduo](https://www.sapiranga.rs.gov.br/meio-ambiente-saiba-como-descartar-corretamente-cada-tipo-de-residuo/)
- Dá respaldo a: embalagens vazias, lavadas e secas; papelão limpo e sem gordura; papelão com gordura não entra na coleta seletiva.
- O "não jogue em rios, ruas ou terrenos" da PET segue o princípio geral da fonte da lata (SINIR), não uma página própria da garrafa.

## Garrafa de vidro

- [Prefeitura de Nova Santa Rosa: cuidados no descarte de vidro quebrado](https://novasantarosa.pr.gov.br/prefeitura-reforca-cuidados-no-descarte-de-vidro-quebrado-para-a-coleta-seletiva/)
- [Agência Brasília (GDF): descarte de objetos cortantes e pontiagudos](https://www.agenciabrasilia.df.gov.br/2024/07/29/descarte-de-objetos-cortantes-e-pontiagudos-deve-seguir-recomendacoes-de-seguranca/)
- Dá respaldo a: vidro, mesmo quebrado, vai na coleta seletiva; embrulhar em jornal ou usar caixa de papelão ou garrafa PET fechada, com a identificação "vidro quebrado"; evitar sacos plásticos, que rasgam.

## Como manter estas fontes

- Mudou um texto de resíduo? Faça um arquivo novo em `migrations/` (o `06` não se edita depois de aplicado) e atualize esta página.
- Troque uma fonte de governo estadual ou municipal pela federal quando conseguir ler a página original.
- Registre aqui a data da consulta de cada fonte nova.
