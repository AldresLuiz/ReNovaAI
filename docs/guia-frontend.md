# Guia do frontend

HTML + CSS + JavaScript puro em `renovaai-front/`. **Sem React, Vite ou bundler.** Donos: Bernardo (telas), Carlos (integração com a API).

## Estrutura

```
index.html        busca, atalhos e lista de resultados
residuo.html      ?id=8: orientação, localização, pontos, mapa, "Como chegar"
css/style.css     botões grandes, alto contraste, foco visível
js/config.js      USAR_MOCK e API_URL
js/api.js         ÚNICO lugar com chamadas ao backend
js/mocks.js       dados de exemplo no formato do contrato
js/index.js       lógica da busca
js/residuo.js     lógica da página do resíduo
```

## Rodar

```bash
cd renovaai-front
python3 -m http.server 8000   # abra http://localhost:8000
```

Módulos JS não funcionam via `file://`.

## Mock x API real

`USAR_MOCK = true` usa só `js/mocks.js`. **Na `main` (desde 02/10) está `USAR_MOCK = false` e `API_URL = ""`**: o site é servido pelo próprio backend, então as chamadas vão para a mesma origem (`/api/...`), sem CORS. Para testar local, suba o backend (`node --env-file=.env src/index.js`) e abra `http://localhost:<PORT>`; ele serve o front. Se o front for servido de **outro** domínio, `API_URL` precisa ser a URL do backend (sem barra no final e sem `/api`). **Cuidado:** a Vercel publicou um front antigo, em mock, em 02/10; confira `/js/config.js` no ar depois de cada deploy. As rotas `/api/categorias`, `/api/residuos`, `/api/residuos/:id` e `/api/residuos/:id/pontos` já existem na `main` e foram testadas contra o Supabase real ([testes-api.md](testes-api.md)). Trate `raio_usado: null` (resíduo sem ponto) e lembre que `horario` e `contato` vêm `null` e `verificado` vem `false` nos pontos de hoje (RN05 e RN12). O formato do mock **é** o de [contrato-api.md](contrato-api.md); se um mudar, mude o outro.

## Foto do resíduo (opcional)

Na tela inicial, a seção **"Não sabe o nome? Envie uma foto"** tem o botão "Tirar ou escolher foto" (`<input type="file" accept="image/jpeg,image/png,image/webp">`, escondido só visualmente, com o foco aparecendo no botão). Ao escolher a imagem, `index.js` valida tipo e tamanho (até 5 MB), chama `identificarFoto` (`api.js`, `POST /api/identificar-foto`, campo `image`) e mostra os resíduos sugeridos no mesmo bloco de resultados da busca, com o link "Ver como descartar" (`residuo.html?id=`). A orientação vem sempre do banco. Se a IA não reconhecer ou falhar, aparece uma mensagem simples pedindo para digitar o nome, e a busca por texto continua funcionando. Com `USAR_MOCK = true` a foto devolve lista vazia.

## Regras de código

- As telas **nunca** usam `fetch` direto; só funções de `api.js`.
- Dados da API entram no DOM **só por `textContent`** (nunca `innerHTML`).
- `type="module"`, `async/await`, tratamento de erro em toda chamada, com mensagem simples ao usuário.

## Comportamento obrigatório (regras de negócio)

- `risco = true`: bloco **"Atenção:"** com os cuidados **antes** da orientação.
- Mostrar sempre "o que não fazer".
- Localização é **opcional** e a orientação aparece sem ela. Se negar, mostrar campo **bairro/cidade** (`/api/geocodificar`).
- `raio_usado` = `ampliado` ou `mais_proximo`: explicar ("Não achamos pontos a até 10 km, mostrando os mais próximos").
- `horario` vazio: "horário não disponível". `verificado = false`: "informação a confirmar".
- Nenhuma busca: mensagem clara e sugestões.
- Não guardar a localização (sem `localStorage`).

## Mapa (Leaflet + OpenStreetMap)

Carregar Leaflet por CDN. Marcador por ponto, com nome e distância. **Ainda não validado com internet**; testar cedo. Se o mapa falhar (`try/catch` ou sem rede), esconder o mapa e manter a **lista com endereço em texto** e o botão "Como chegar" (RNF08).

"Como chegar": `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG` com `target="_blank" rel="noopener"`.

## Acessibilidade e mobile

Alto contraste; fonte grande (mín. 16px, preferir 18px); botões com área de clique ampla (mín. 44×44px); foco visível e navegação por teclado; `label` em todo campo; não depender só de cor; ícone sempre com texto; mobile primeiro (`meta viewport`, layout de uma coluna). Linguagem do dia a dia e frases curtas.

## Checklist antes de entregar uma tela

- [ ] Funciona com mock e com API real
- [ ] Usável só com teclado
- [ ] Testada em tela de celular
- [ ] Erro de rede mostra mensagem amigável
- [ ] Sem `innerHTML` com dados da API
