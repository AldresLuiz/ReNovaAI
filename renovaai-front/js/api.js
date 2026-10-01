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

  const resposta = await fetch(
    `${API_URL}/api/categorias`
  );

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as categorias.");
  }

  return resposta.json();
}

export async function buscarResiduos(termo) {
  if (USAR_MOCK) {
    return buscarResiduosMock(termo);
  }

  const resposta = await fetch(
    `${API_URL}/api/residuos?q=${encodeURIComponent(termo)}`
  );

  if (!resposta.ok) {
    throw new Error("Não foi possível buscar os resíduos.");
  }

  return resposta.json();
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

  const resposta = await fetch(
    `${API_URL}/api/residuos/${encodeURIComponent(id)}`
  );

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as informações do resíduo.");
  }

  return resposta.json();
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