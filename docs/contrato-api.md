# Contrato da API

> Proposta a fechar na primeira hora. **Mudou algo? Avise o grupo antes**, e atualize este arquivo e `renovaai-front/js/mocks.js`.

- Base: `API_URL` configurável (front: `js/config.js`).
- Erros: status HTTP correto e corpo `{ "erro": "mensagem em português simples" }`.
- Busca sem resultado: **lista vazia `[]`, não erro**.
- CORS liberado para o domínio do front.
- Rotas de resíduos e pontos **não exigem login**.

| Rota | Uso |
| --- | --- |
| `GET /api/categorias` | Categorias da tela inicial |
| `GET /api/residuos?q=latinha` | Busca com sinônimos |
| `GET /api/residuos/:id` | Orientação de descarte |
| `GET /api/residuos/:id/pontos?lat=..&lng=..` | Pontos próximos |
| `GET /api/geocodificar?q=bairro` | Bairro/cidade → coordenada |
| `POST /api/identificar-foto` | Foto do resíduo (opcional): a IA diz a categoria, a API devolve os resíduos do banco |

## GET /api/categorias

Lista de `{ id, nome, icone }`.

## GET /api/residuos?q=latinha

Usa a função SQL `buscar_residuos`. Ignora acento e caixa, tolera erro de digitação.

```json
[{ "id": 3, "nome": "Lata de alumínio", "categoria": "Metais", "similaridade": 0.8 }]
```

`q` vazio, ausente ou com mais de 100 caracteres: `400` com `{ "erro": "..." }`.

## GET /api/residuos/:id

```json
{
  "id": 8,
  "nome": "Pilhas e baterias",
  "categoria": "Pilhas e baterias",
  "risco": true,
  "cuidados": "Contêm metais pesados. Não perfure, não queime e não abra.",
  "orientacao_descarte": "Guarde em um pote fechado e entregue em um ponto de coleta especializado.",
  "nao_fazer": "Não jogue no lixo comum, na rua ou em rios.",
  "reciclavel": false
}
```

Id inexistente, inativo ou inválido (texto, zero, negativo, decimal): `404` com `{ "erro": "..." }`.

## GET /api/residuos/:id/pontos?lat=-8.28&lng=-35.97

Usa `pontos_proximos`. `raio_usado`: `inicial` (10 km) | `ampliado` (25 km) | `mais_proximo`.

```json
{
  "raio_usado": "inicial",
  "pontos": [
    {
      "id": 1, "nome": "Nome do ponto", "endereco": "Endereço",
      "lat": -8.0, "lng": -35.0, "distancia_km": 2.4,
      "horario": null, "contato": null, "verificado": false
    }
  ]
}
```

`lat`/`lng` ausentes ou inválidos (texto, vazio, fora de -90..90 e -180..180): `400` com `{ "erro": "..." }`. Resíduo inexistente, inativo ou com id inválido: `404`. Nenhum ponto aceita o resíduo: `200` com `{ "raio_usado": null, "pontos": [] }`. O backend **não armazena** a localização nem a escreve no log (RNF07).

## GET /api/geocodificar?q=bairro

Proxy para o Nominatim. Resposta `{ "lat": -8.28, "lng": -35.97 }`. Não encontrado: `404`. Serviço fora do ar: `502` com mensagem simples. Muitas buscas ao mesmo tempo: `429`. Para respeitar a política de uso do Nominatim (User-Agent identificado, no máximo 1 requisição por segundo), o backend guarda buscas repetidas por 10 minutos e espaça as chamadas ao Nominatim.

## POST /api/identificar-foto

Opcional (fora do caminho crítico). Recebe uma imagem em `multipart/form-data`, campo **`image`** (JPG, PNG ou WebP, até 5 MB). A IA (AWS Bedrock) **só classifica a categoria**; a API traduz essa categoria nos **resíduos ativos do banco**. A orientação de descarte vem sempre de `GET /api/residuos/:id`, nunca da IA.

```json
{ "categoria": "Pilhas e baterias", "residuos": [{ "id": 2, "nome": "Pilhas e baterias" }] }
```

- Categoria não reconhecida (ou a IA respondeu "nao_identificado"): `200` com `{ "categoria": null, "residuos": [] }`. O front cai para a busca por texto.
- O nome da categoria é comparado sem acento nem caixa, e com tolerância a pequenas diferenças ("plastico" vale "Plásticos").
- Erros, todos com `{ "erro": "..." }`: sem imagem, formato inválido ou campo com nome errado `400`; foto maior que 5 MB `413`; falha da IA ou do banco `500`.
- Se a IA falhar, **o resto da API segue funcionando**.
