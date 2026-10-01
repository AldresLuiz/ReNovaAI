// Dados de exemplo que seguem o contrato definido em docs/contrato-api.md.
// Ao alterar o contrato da API, este arquivo também deve ser atualizado.

export const mockCategorias = [
  {
    id: 1,
    nome: "Plásticos",
    icone: "🧴"
  },
  {
    id: 2,
    nome: "Papel e papelão",
    icone: "📦"
  },
  {
    id: 3,
    nome: "Vidro",
    icone: "🍾"
  },
  {
    id: 4,
    nome: "Metais",
    icone: "🥫"
  },
  {
    id: 5,
    nome: "Pilhas e baterias",
    icone: "🔋"
  },
  {
    id: 6,
    nome: "Eletrônicos",
    icone: "📱"
  },
  {
    id: 7,
    nome: "Óleo de cozinha",
    icone: "🛢️"
  }
];

export const mockBuscaResiduos = [
  {
    id: 3,
    nome: "Lata de alumínio",
    categoria: "Metais",
    similaridade: 0.8
  },
  {
    id: 8,
    nome: "Pilhas e baterias",
    categoria: "Pilhas e baterias",
    similaridade: 1
  }
];

export const mockResiduos = [
  {
    id: 3,
    nome: "Lata de alumínio",
    categoria: "Metais",
    risco: false,
    cuidados: null,
    orientacao_descarte:
      "Separe a lata dos resíduos orgânicos e encaminhe para a coleta seletiva ou ponto de reciclagem.",
    nao_fazer:
      "Não descarte na rua, em rios ou junto a resíduos orgânicos.",
    reciclavel: true
  },
  {
    id: 8,
    nome: "Pilhas e baterias",
    categoria: "Pilhas e baterias",
    risco: true,
    cuidados:
      "Contêm metais pesados. Não perfure, não queime e não abra.",
    orientacao_descarte:
      "Guarde em um pote fechado e entregue em um ponto de coleta especializado.",
    nao_fazer:
      "Não jogue no lixo comum, na rua ou em rios.",
    reciclavel: false
  }
];