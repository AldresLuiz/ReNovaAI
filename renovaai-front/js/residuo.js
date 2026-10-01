import { buscarResiduoPorId } from "./api.js";

const nomeResiduo = document.getElementById("nome-residuo");
const categoriaResiduo = document.getElementById("categoria-residuo");

const conteudoResiduo = document.getElementById("conteudo-residuo");
const mensagemErro = document.getElementById("mensagem-erro-residuo");

const avisoRisco = document.getElementById("aviso-risco");
const cuidadosResiduo = document.getElementById("cuidados-residuo");

const orientacaoResiduo = document.getElementById("orientacao-residuo");
const naoFazerResiduo = document.getElementById("nao-fazer-residuo");

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