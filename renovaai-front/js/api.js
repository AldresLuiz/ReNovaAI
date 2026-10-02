import { USAR_MOCK, API_URL } from "./config.js";
import {
  mockBuscaResiduos,
  mockResiduos,
  mockCategorias
} from "./mocks.js";

export async function buscarCategorias() {
  if (USAR_MOCK) {
    return mockCategorias;
  }

  return requisitar(
    "/api/categorias",
    "Não foi possível carregar as categorias."
  );
}

export async function buscarResiduos(termo) {
  if (USAR_MOCK) {
    return buscarResiduosMock(termo);
  }

  return requisitar(
    `/api/residuos?q=${encodeURIComponent(termo)}`,
    "Não foi possível buscar os resíduos."
  );
}

export async function buscarResiduoPorId(id) {
  if (USAR_MOCK) {
    const residuo = mockResiduos.find(
      (item) => item.id === Number(id)
    );

    if (!residuo) {
      throw new Error("Resíduo não encontrado.");
    }

    return residuo;
  }

  return requisitar(
    `/api/residuos/${encodeURIComponent(id)}`,
    "Não foi possível carregar as informações do resíduo."
  );
}

export async function buscarPontosProximos(id, lat, lng) {
  return requisitar(
    `/api/residuos/${encodeURIComponent(id)}/pontos?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    "Não foi possível carregar os pontos de coleta próximos."
  );
}

export async function geocodificar(local) {
  return requisitar(
    `/api/geocodificar?q=${encodeURIComponent(local)}`,
    "Não foi possível encontrar esse local."
  );
}

// Foto (opcional): a IA só diz a categoria; devolve { categoria, residuos: [{ id, nome }] }.
// Sem categoria reconhecida: { categoria: null, residuos: [] }.
export async function identificarFoto(arquivo) {
  if (USAR_MOCK) {
    return { categoria: null, residuos: [] };
  }

  const formulario = new FormData();
  formulario.append("image", arquivo);

  return requisitar(
    "/api/identificar-foto",
    "Não foi possível identificar a foto agora.",
    { method: "POST", body: formulario }
  );
}

async function requisitar(caminho, mensagemPadrao, opcoes) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  } catch (erro) {
    console.error(erro);
    throw new Error(
      "Não foi possível conectar ao servidor. Tente novamente em alguns instantes."
    );
  }

  let dados;

  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    throw new Error(
      dados?.erro ||
      dados?.error ||
      mensagemPadrao
    );
  }

  return dados;
}

function buscarResiduosMock(termo) {
  const termoNormalizado = normalizar(termo);

  if (!termoNormalizado) {
    return [];
  }

  return mockBuscaResiduos.filter((residuo) => {
    const nome = normalizar(residuo.nome);
    const categoria = normalizar(residuo.categoria);

    return (
      nome.includes(termoNormalizado) ||
      categoria.includes(termoNormalizado)
    );
  });
}

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}