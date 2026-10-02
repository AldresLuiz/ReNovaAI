import {
  buscarResiduoPorId,
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
const mapaPontos = document.getElementById("mapa-pontos");

let mapa = null;

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

      mostrarMensagemLocalizacao(
        "Localização obtida. Agora podemos buscar pontos de coleta próximos."
      );

      mostrarMapa(coordenadas);
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

    mostrarMensagemLocalizacao(
      "Local encontrado. Agora podemos buscar pontos de coleta próximos."
    );

    mostrarMapa(coordenadas);
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

function mostrarMapa(coordenadas) {
  if (
    !coordenadas ||
    !Number.isFinite(Number(coordenadas.lat)) ||
    !Number.isFinite(Number(coordenadas.lng))
  ) {
    mostrarMensagemLocalizacao(
      "Não foi possível exibir o mapa para essa localização."
    );
    return;
  }

  if (typeof L === "undefined") {
    console.error("Leaflet não foi carregado.");

    mostrarMensagemLocalizacao(
      "O mapa não pôde ser carregado. As informações dos pontos continuarão disponíveis em texto."
    );
    return;
  }

  const lat = Number(coordenadas.lat);
  const lng = Number(coordenadas.lng);

  secaoPontos.hidden = false;

  if (!mapa) {
    mapa = L.map(mapaPontos).setView([lat, lng], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(mapa);
  } else {
    mapa.setView([lat, lng], 13);
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