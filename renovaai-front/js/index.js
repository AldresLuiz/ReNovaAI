import {
  buscarResiduos,
  buscarCategorias,
  identificarFoto
} from "./api.js";

const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("q");
const secaoResultados = document.getElementById("resultados");
const mensagemResultados = document.getElementById("mensagem-resultados");
const listaResultados = document.getElementById("lista-resultados");
const listaCategorias = document.getElementById("lista-categorias");
const campoFoto = document.getElementById("foto");
const mensagemFoto = document.getElementById("mensagem-foto");

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024; // 5 MB, igual ao servidor

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

// Foto (opcional): se falhar, a busca por texto continua funcionando.
campoFoto.addEventListener("change", async () => {
  const arquivo = campoFoto.files[0];

  if (!arquivo) {
    return;
  }

  mensagemFoto.textContent = "";
  limparResultados();
  secaoResultados.hidden = true;

  if (!TIPOS_FOTO.includes(arquivo.type)) {
    mensagemFoto.textContent = "Envie uma foto em JPG, PNG ou WebP.";
    campoFoto.value = "";
    return;
  }

  if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
    mensagemFoto.textContent = "A foto é grande demais. Envie uma de até 5 MB.";
    campoFoto.value = "";
    return;
  }

  mensagemFoto.textContent = "Analisando a foto...";

  try {
    const resposta = await identificarFoto(arquivo);

    if (resposta.residuos.length === 0) {
      mensagemFoto.textContent =
        "Não conseguimos identificar o item pela foto. Digite o nome dele na busca acima.";
      campoBusca.focus();
      return;
    }

    mensagemFoto.textContent = `Pela foto, parece ser: ${resposta.categoria}. Confirme abaixo e veja como descartar.`;

    // A orientação de descarte vem sempre do banco (residuo.html), nunca da IA.
    mostrarResultados(
      resposta.residuos.map((residuo) => ({
        ...residuo,
        categoria: resposta.categoria
      }))
    );
  } catch (erro) {
    console.error(erro);
    mensagemFoto.textContent =
      "Não foi possível analisar a foto agora. Você pode digitar o nome do item na busca acima.";
  } finally {
    campoFoto.value = "";
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