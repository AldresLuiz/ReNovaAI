import {
  buscarResiduos,
  buscarCategorias
} from "./api.js";

const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("q");
const secaoResultados = document.getElementById("resultados");
const mensagemResultados = document.getElementById("mensagem-resultados");
const listaResultados = document.getElementById("lista-resultados");
const listaCategorias = document.getElementById("lista-categorias");

formBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const termo = campoBusca.value.trim();

  if (!termo) {
    return;
  }

  mostrarMensagem("Buscando...");
  limparResultados();

  try {
    const residuos = await buscarResiduos(termo);

    mostrarResultados(residuos);
  } catch (erro) {
    console.error(erro);
    mostrarErro();
  }
});

function mostrarResultados(residuos) {
  limparResultados();

  if (residuos.length === 0) {
    mostrarMensagem(
      "Não encontramos esse resíduo. Tente outro nome, como pilha, lata ou papelão."
    );
    return;
  }

  const quantidade = residuos.length;

  mostrarMensagem(
    `${quantidade} ${quantidade === 1 ? "resultado encontrado" : "resultados encontrados"}.`
  );

  residuos.forEach((residuo) => {
    const item = document.createElement("li");

    const nome = document.createElement("strong");
    nome.textContent = residuo.nome;

    const categoria = document.createElement("p");
    categoria.textContent = residuo.categoria;

    const link = document.createElement("a");
    link.href = `residuo.html?id=${encodeURIComponent(residuo.id)}`;
    link.textContent = "Ver como descartar";

    item.append(nome, categoria, link);
    listaResultados.appendChild(item);
  });
}

function mostrarMensagem(mensagem) {
  secaoResultados.hidden = false;
  mensagemResultados.textContent = mensagem;
}

function mostrarErro() {
  limparResultados();

  mostrarMensagem(
    "Não foi possível fazer a busca agora. Tente novamente em alguns instantes."
  );
}

function limparResultados() {
  listaResultados.replaceChildren();
}

async function carregarCategorias() {
  try {
    const categorias = await buscarCategorias();

    categorias.forEach((categoria) => {
      const item = document.createElement("li");
      const botao = document.createElement("button");
      const icone = document.createElement("span");
      const nome = document.createElement("span");

      botao.type = "button";
      botao.classList.add("atalho-categoria");

      icone.textContent = categoria.icone;
      icone.setAttribute("aria-hidden", "true");

      nome.textContent = categoria.nome;

      botao.append(icone, nome);

      botao.addEventListener("click", async () => {
        campoBusca.value = categoria.nome;

        mostrarMensagem("Buscando...");
        limparResultados();

        try {
          const residuos = await buscarResiduos(categoria.nome);
          mostrarResultados(residuos);
        } catch (erro) {
          console.error(erro);
          mostrarErro();
        }
      });

      item.appendChild(botao);
      listaCategorias.appendChild(item);
    });
  } catch (erro) {
    console.error(erro);
  }
}

carregarCategorias();