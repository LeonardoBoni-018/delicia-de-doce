/* =========================================================
   products.js — TODO O CONTEÚDO EDITÁVEL DA LOJA FICA AQUI
   Troque textos, preços, fotos e configurações sem mexer
   em index.html, styles.css ou app.js.
   ========================================================= */

/* ---------- Configurações da loja ---------- */
const CONFIG = {
  nome: "Delícia de Doce",
  slogan: "Box, bolos e doces feitos com carinho",

  // Número do WhatsApp que recebe os pedidos (só dígitos: 55 + DDD + número)
  whatsapp: "5551981546126",

  instagram: "https://instagram.com/prideliciadedoce",
  instagramUsuario: "@prideliciadedoce",

  // Quantos dias de antecedência mínima para encomendas
  antecedenciaDias: 2,

  // Cidades atendidas na entrega (aparecem no select do formulário)
  cidadesEntrega: ["São Leopoldo", "Novo Hamburgo"],

  avisoTaxa: "A taxa de entrega varia por bairro e será confirmada pelo WhatsApp",

  // Mostra a faixa "Prévia — demonstração para aprovação". Mude para false ao publicar de verdade.
  modoPrevia: true,
};

/* ---------- Categorias (ordem dos botões de filtro) ---------- */
const CATEGORIAS = ["Box", "Bolos", "Doces"];

/* ---------- Produtos ----------
   Campos de cada produto:
   - id:        identificador único (sem espaços)
   - nome, descricao, categoria (uma das CATEGORIAS)
   - preco:     preço base em reais (número, ex.: 39.9)
   - foto:      caminho da imagem, ex.: "img/box-mini.jpg". Deixe "" para usar o placeholder.
   - emoji, cor: usados no placeholder enquanto não há foto
   - opcoes:    (opcional) lista de escolhas. Cada item tem "acrescimo" somado ao preço base.
   - exemplo:   true = dado de exemplo, SUBSTITUIR pelos reais da cliente.
*/
const PRODUCTS = [
  {
    id: "box-mini-doces",
    nome: "Box Mini Doces",
    descricao: "Caixa com 12 docinhos gourmet sortidos, perfeita para presentear.",
    categoria: "Box",
    preco: 42.0,
    foto: "img/box-mini-doces.jpg",
    emoji: "🎁",
    cor: ["#f3d6d3", "#e3a9a2"],
    opcoes: [
      {
        nome: "Sabor",
        escolhas: [
          { rotulo: "Brigadeiro", acrescimo: 0 },
          { rotulo: "Sortidos", acrescimo: 0 },
          { rotulo: "Ninho com Nutella", acrescimo: 6 },
        ],
      },
    ],
    exemplo: true,
  },
  {
    id: "box-cafe-manha",
    nome: "Box Café da Manhã",
    descricao: "Fatia de bolo, brownie, cookies e brigadeiros numa caixinha especial.",
    categoria: "Box",
    preco: 69.9,
    foto: "img/box-cafe-manha.jpg",
    emoji: "☕",
    cor: ["#efe2cf", "#cfa98a"],
    exemplo: true,
  },
  {
    id: "bolo-vulcao",
    nome: "Bolo Caseiro Coberto",
    descricao: "Bolo fofinho com cobertura de chocolate e granulado, do jeitinho de vó.",
    categoria: "Bolos",
    preco: 55.0,
    foto: "img/bolo-vulcao.jpg",
    emoji: "🎂",
    cor: ["#ead1c5", "#b7826a"],
    opcoes: [
      {
        nome: "Sabor",
        escolhas: [
          { rotulo: "Cenoura com chocolate", acrescimo: 0 },
          { rotulo: "Chocolate", acrescimo: 0 },
          { rotulo: "Ninho", acrescimo: 5 },
        ],
      },
      {
        nome: "Tamanho",
        escolhas: [
          { rotulo: "Pequeno (8 fatias)", acrescimo: 0 },
          { rotulo: "Grande (15 fatias)", acrescimo: 35 },
        ],
      },
    ],
    exemplo: true,
  },
  {
    id: "bolo-festa",
    nome: "Bolo de Festa Decorado",
    descricao: "Bolo recheado e decorado com o tema da sua comemoração. Por kg.",
    categoria: "Bolos",
    preco: 110.0,
    foto: "img/bolo-festa.jpg",
    emoji: "🎉",
    cor: ["#f6dfe3", "#d99aa5"],
    opcoes: [
      {
        nome: "Tamanho",
        escolhas: [
          { rotulo: "1 kg", acrescimo: 0 },
          { rotulo: "2 kg", acrescimo: 100 },
          { rotulo: "3 kg", acrescimo: 200 },
        ],
      },
    ],
    exemplo: true,
  },
  {
    id: "brigadeiros-cento",
    nome: "Brigadeiros Gourmet (cento)",
    descricao: "100 brigadeiros enrolados à mão, em forminhas, para festas.",
    categoria: "Doces",
    preco: 150.0,
    foto: "img/brigadeiros-cento.jpg",
    emoji: "🍫",
    cor: ["#e9d4c8", "#8f5e45"],
    exemplo: true,
  },
  {
    id: "brownie",
    nome: "Brownie Recheado",
    descricao: "Brownie de chocolate meio amargo com recheio cremoso. Unidade.",
    categoria: "Doces",
    preco: 12.0,
    foto: "img/brownie.jpg",
    emoji: "🟫",
    cor: ["#f0e0d6", "#a8735a"],
    exemplo: true,
  },
];

/* ---------- Créditos das fotos de EXEMPLO (Wikimedia Commons) ----------
   As fotos atuais são ilustrativas e licenciadas. Quando trocar pelas fotos
   reais da cliente, apague a linha correspondente (ou deixe a lista vazia []).
*/
const CREDITOS_FOTOS = [
  "Brigadeiros — Rodrigogomesonetwo, CC BY-SA 4.0",
  "Carrot cake slice and latte — Andy Li, CC0",
  "Bolo de cenoura com chocolate e granulado — Sintegrity, CC BY-SA 4.0",
  "Birthday Cake (decorated) — Horacio Cambeiro, CC BY 3.0",
  "Brigadeiro enrolado — Márcia Cristina Machado, CC BY-SA 4.0",
  "Chocolate Brownie Decorated — Miansari66, CC0",
  "Piece of chocolate cake on a white plate — Daria Yakovleva, CC0",
];
