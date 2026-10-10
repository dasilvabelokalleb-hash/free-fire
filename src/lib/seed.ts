import type { Product } from "./types";

export const initialProducts: Product[] = [
  {
    id: "iphone-15-pro-256",
    name: "iPhone 15 Pro 256GB",
    category: "Celular",
    price: 5290,
    condition: "Seminovo A+",
    battery: 94,
    description:
      "Titanium de verdade. Aparelho revisado por completo, sem marcas aparentes e pronto para acompanhar você. Acompanha cabo USB-C e 90 dias de garantia Bello TECH.",
    specs: ["Titânio natural", "256GB de armazenamento", "Chip A17 Pro"],
    status: "available",
    featured: true,
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
  {
    id: "iphone-14-128",
    name: "iPhone 14 128GB",
    category: "Celular",
    price: 3290,
    condition: "Como novo",
    battery: 89,
    description:
      "A escolha perfeita para dar o próximo passo. Aparelho testado, câmera impecável e saúde da bateria conferida. Acompanha caixa e cabo.",
    specs: ["Azul meia-noite", "128GB de armazenamento", "Câmera dupla de 12MP"],
    status: "available",
    featured: false,
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
  {
    id: "iphone-13-128",
    name: "iPhone 13 128GB",
    category: "Celular",
    price: 2490,
    condition: "Seminovo A+",
    battery: 87,
    description:
      "O clássico que nunca decepciona. Excelente conservação, Face ID funcionando perfeitamente e 90 dias de garantia Bello TECH.",
    specs: ["Rosa", "128GB de armazenamento", "Tela Super Retina XDR"],
    status: "available",
    featured: true,
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
  {
    id: "macbook-air-m1",
    name: "MacBook Air M1 256GB",
    category: "Notebook",
    price: 4590,
    condition: "Muito conservado",
    description:
      "Silencioso, leve e rápido. MacBook revisado, carregador original incluso e bateria em excelente estado. Garantia Bello TECH de 90 dias.",
    specs: ["Chip Apple M1", "256GB SSD", "8GB de memória unificada"],
    status: "available",
    featured: false,
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
  {
    id: "apple-watch-s9",
    name: "Apple Watch Series 9",
    category: "Relógio",
    price: 1890,
    condition: "Como novo",
    battery: 100,
    description:
      "Seu parceiro para saúde, treinos e rotina. Revisado, higienizado e acompanhado de pulseira esportiva e carregador magnético.",
    specs: ["GPS, caixa de 45mm", "Tela Retina Always-On", "Pulseira esportiva inclusa"],
    status: "available",
    featured: false,
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
  {
    id: "airpods-pro-2",
    name: "AirPods Pro 2ª geração",
    category: "Acessório",
    price: 1190,
    condition: "Seminovo A+",
    description:
      "Cancelamento de ruído inteligente e som imersivo. Original, higienizado e testado. Acompanha estojo MagSafe e pontas extras.",
    specs: ["Cancelamento ativo de ruído", "Estojo MagSafe com USB-C", "Áudio Espacial"],
    status: "available",
    featured: true,
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
];
