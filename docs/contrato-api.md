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
| `POST /api/identificar-foto` | Fase 2 (opcional) |

## GET /api/categorias

Lista de `{ id, nome, icone }`.

## GET /api/residuos?q=latinha

Usa a função SQL `buscar_residuos`. Ignora acento e caixa, tolera erro de digitação.

```json
[{ "id": 3, "nome": "Lata de alumínio", "categoria": "Metais", "similaridade": 0.8 }]
```

`q` vazio ou ausente: `400` com `{ "erro": "..." }`.

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

Id inexistente ou inativo: `404`.

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

`lat`/`lng` ausentes ou inválidos: `400`. O backend **não armazena** a localização (RNF07).

## GET /api/geocodificar?q=bairro

Proxy para o Nominatim. Resposta `{ "lat": -8.28, "lng": -35.97 }`. Não encontrado: `404`. Serviço fora do ar: `502` com mensagem simples. Muitas buscas ao mesmo tempo: `429`. Para respeitar a política de uso do Nominatim (User-Agent identificado, no máximo 1 requisição por segundo), o backend guarda buscas repetidas por 10 minutos e espaça as chamadas ao Nominatim.

## POST /api/identificar-foto

Fase 2, só se sobrar tempo. Recebe imagem e devolve resíduos **sugeridos** (ids do banco). A IA só classifica; a orientação vem de `GET /api/residuos/:id`.
