import {
  buscarResiduoPorId,
  buscarPontosProximos,
  geocodificar
} from "./api.js";

const nomeResiduo = document.getElementById("nome-residuo");
const categoriaResiduo = document.getElementById("categoria-residuo");

const conteudoResiduo = document.getElementById("conteudo-residuo");
const mensagemErro = document.getElementById("mensagem-erro-residuo");

const avisoRisco = document.getElementById("aviso-risco");
const cuidadosResiduo = document.getElementById("cuidados-residuo");

const orientacaoResiduo = document.getElementById("orientacao-residuo");
const naoFazerResiduo = document.getElementById("nao-fazer-residuo");

const botaoUsarLocalizacao = document.getElementById("usar-localizacao");
const botaoBuscarPorLocal = document.getElementById("buscar-por-local");
const formLocal = document.getElementById("form-local");
const campoLocal = document.getElementById("campo-local");
const mensagemLocalizacao = document.getElementById("mensagem-localizacao");

const secaoPontos = document.getElementById("secao-pontos");
const mensagemRaio = document.getElementById("mensagem-raio");
const mapaPontos = document.getElementById("mapa-pontos");
const listaPontos = document.getElementById("lista-pontos");

let mapa = null;
let camadaMarcadores = null;
let residuoId = null;

botaoUsarLocalizacao.addEventListener("click", () => {
  if (!navigator.geolocation) {
    mostrarMensagemLocalizacao(
      "Seu navegador não oferece acesso à localização. Busque por bairro ou cidade."
    );

    mostrarFormularioLocal();
    return;
  }

  mostrarMensagemLocalizacao("Obtendo sua localização...");

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      const coordenadas = {
        lat: posicao.coords.latitude,
        lng: posicao.coords.longitude
      };

      buscarPontosDaLocalizacao(coordenadas);
    },
    (erro) => {
      console.error(erro);

      if (erro.code === erro.PERMISSION_DENIED) {
        mostrarMensagemLocalizacao(
          "Localização não autorizada. Busque por bairro ou cidade."
        );
      } else {
        mostrarMensagemLocalizacao(
          "Não foi possível obter sua localização. Busque por bairro ou cidade."
        );
      }

      mostrarFormularioLocal();
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
});

botaoBuscarPorLocal.addEventListener("click", () => {
  mostrarFormularioLocal();
});

formLocal.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const local = campoLocal.value.trim();

  if (!local) {
    return;
  }

  mostrarMensagemLocalizacao("Buscando localização...");

  try {
    const coordenadas = await geocodificar(local);

    await buscarPontosDaLocalizacao(coordenadas);
  } catch (erro) {
    console.error(erro);

    mostrarMensagemLocalizacao(
      erro.message || "Não foi possível encontrar esse local."
    );
  }
});

function mostrarFormularioLocal() {
  formLocal.hidden = false;
  campoLocal.focus();
}

function mostrarMensagemLocalizacao(mensagem) {
  mensagemLocalizacao.textContent = mensagem;
  mensagemLocalizacao.hidden = false;
}

async function buscarPontosDaLocalizacao(coordenadas) {
  if (!residuoId) {
    mostrarMensagemLocalizacao(
      "Não foi possível identificar o resíduo para buscar pontos de coleta."
    );
    return;
  }

  const lat = Number(coordenadas?.lat);
  const lng = Number(coordenadas?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    mostrarMensagemLocalizacao(
      "Não foi possível usar essa localização para buscar pontos de coleta."
    );
    return;
  }

  mostrarMensagemLocalizacao("Buscando pontos de coleta próximos...");

  try {
    const resultado = await buscarPontosProximos(residuoId, lat, lng);

    const pontos = Array.isArray(resultado?.pontos)
      ? [...resultado.pontos]
      : [];

    pontos.sort(
      (a, b) =>
        Number(a.distancia_km ?? Infinity) -
        Number(b.distancia_km ?? Infinity)
    );

    renderizarPontos(pontos, resultado?.raio_usado, { lat, lng });
  } catch (erro) {
    console.error(erro);

    secaoPontos.hidden = true;

    mostrarMensagemLocalizacao(
      erro.message || "Não foi possível buscar os pontos de coleta."
    );
  }
}

function renderizarPontos(pontos, raioUsado, coordenadasUsuario) {
  listaPontos.replaceChildren();

  secaoPontos.hidden = false;

  mostrarMensagemRaio(raioUsado, pontos.length);

  if (pontos.length === 0) {
    mapaPontos.hidden = true;

    mostrarMensagemLocalizacao(
      "Não encontramos pontos de coleta para este resíduo."
    );

    return;
  }

  mostrarMensagemLocalizacao(
    `${pontos.length} ponto${pontos.length === 1 ? "" : "s"} de coleta encontrado${pontos.length === 1 ? "" : "s"}.`
  );

  for (const ponto of pontos) {
    listaPontos.appendChild(criarItemPonto(ponto));
  }

  mostrarMapa(coordenadasUsuario, pontos);
}

function mostrarMensagemRaio(raioUsado, quantidadePontos) {
  if (quantidadePontos === 0 || !raioUsado) {
    mensagemRaio.textContent =
      "Não encontramos pontos de coleta disponíveis para este resíduo.";
    mensagemRaio.hidden = false;
    return;
  }

  if (raioUsado === "ampliado") {
    mensagemRaio.textContent =
      "Não encontramos opções muito próximas, então ampliamos a busca para até 25 km.";
    mensagemRaio.hidden = false;
    return;
  }

  if (raioUsado === "mais_proximo") {
    mensagemRaio.textContent =
      "Não encontramos opções próximas. Estamos mostrando o ponto disponível mais próximo.";
    mensagemRaio.hidden = false;
    return;
  }

  mensagemRaio.hidden = true;
}

function criarItemPonto(ponto) {
  const item = document.createElement("li");
  item.className = "item-ponto";

  const nome = document.createElement("h4");
  nome.textContent = ponto.nome || "Ponto de coleta";

  const endereco = document.createElement("p");
  endereco.textContent = ponto.endereco || "Endereço não disponível";

  const distancia = document.createElement("p");
  distancia.className = "distancia-ponto";

  const distanciaKm = Number(ponto.distancia_km);

  distancia.textContent = Number.isFinite(distanciaKm)
    ? `${distanciaKm.toFixed(2)} km de distância`
    : "Distância não disponível";

  const horario = document.createElement("p");
  horario.textContent = ponto.horario
    ? `Horário: ${ponto.horario}`
    : "Horário não disponível";

  item.append(nome, endereco, distancia, horario);

  if (ponto.verificado === false) {
    const status = document.createElement("p");
    status.className = "status-ponto";
    status.textContent = "Informação a confirmar";

    item.appendChild(status);
  }

  const lat = Number(ponto.lat);
  const lng = Number(ponto.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const linkRota = document.createElement("a");

    linkRota.className = "como-chegar";
    linkRota.href =
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
    linkRota.target = "_blank";
    linkRota.rel = "noopener";
    linkRota.textContent = "Como chegar";
    linkRota.setAttribute(
      "aria-label",
      `Como chegar ao ponto de coleta ${ponto.nome || ""}`
    );

    item.appendChild(linkRota);
  }

  return item;
}

function mostrarMapa(coordenadasUsuario, pontos) {
  if (typeof L === "undefined") {
    console.error("Leaflet não foi carregado.");

    mapaPontos.hidden = true;

    mostrarMensagemLocalizacao(
      "O mapa não pôde ser carregado. Os pontos continuam disponíveis na lista."
    );

    return;
  }

  const latUsuario = Number(coordenadasUsuario?.lat);
  const lngUsuario = Number(coordenadasUsuario?.lng);

  if (!Number.isFinite(latUsuario) || !Number.isFinite(lngUsuario)) {
    mapaPontos.hidden = true;

    mostrarMensagemLocalizacao(
      "Não foi possível exibir o mapa. Os pontos continuam disponíveis na lista."
    );

    return;
  }

  mapaPontos.hidden = false;

  if (!mapa) {
    mapa = L.map(mapaPontos).setView([latUsuario, lngUsuario], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(mapa);
  }

  if (camadaMarcadores) {
    camadaMarcadores.clearLayers();
  } else {
    camadaMarcadores = L.layerGroup().addTo(mapa);
  }

  const limites = [];

  for (const ponto of pontos) {
    const lat = Number(ponto.lat);
    const lng = Number(ponto.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    const distanciaKm = Number(ponto.distancia_km);

    const textoDistancia = Number.isFinite(distanciaKm)
      ? `${distanciaKm.toFixed(2)} km`
      : "Distância não disponível";

    const marcador = L.marker([lat, lng]);

    const nomePonto = ponto.nome || "Ponto de coleta";

    marcador.bindPopup(
      document.createTextNode(`${nomePonto} — ${textoDistancia}`)
    );

    marcador.addTo(camadaMarcadores);

    limites.push([lat, lng]);
  }

  if (limites.length === 1) {
    mapa.setView(limites[0], 15);
  } else if (limites.length > 1) {
    mapa.fitBounds(limites, {
      padding: [30, 30]
    });
  } else {
    mapa.setView([latUsuario, lngUsuario], 13);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mapa.invalidateSize();
    });
  });
}

async function carregarResiduo() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("id");

  if (!id) {
    mostrarErro("Não foi possível identificar o resíduo.");
    return;
  }

  residuoId = id;

  try {
    const residuo = await buscarResiduoPorId(id);

    preencherResiduo(residuo);
  } catch (erro) {
    console.error(erro);

    mostrarErro("Não foi possível carregar as informações do resíduo.");
  }
}

function preencherResiduo(residuo) {
  nomeResiduo.textContent = residuo.nome;
  categoriaResiduo.textContent = residuo.categoria;

  orientacaoResiduo.textContent = residuo.orientacao_descarte;
  naoFazerResiduo.textContent = residuo.nao_fazer;

  if (residuo.risco) {
    cuidadosResiduo.textContent = residuo.cuidados;
    avisoRisco.hidden = false;
  } else {
    avisoRisco.hidden = true;
  }

  conteudoResiduo.hidden = false;
}

function mostrarErro(mensagem) {
  nomeResiduo.textContent = "Resíduo não encontrado";

  conteudoResiduo.hidden = true;

  mensagemErro.textContent = mensagem;
  mensagemErro.hidden = false;
}

carregarResiduo();