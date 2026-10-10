export type ProductCategory =
  | "Celular"
  | "Tablet"
  | "Notebook"
  | "Relógio"
  | "Acessório";

export type ProductStatus = "available" | "sold";

export type ProductMedia = {
  type: "image" | "video";
  src: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  condition: string;
  battery?: number;
  description: string;
  specs: string[];
  status: ProductStatus;
  featured: boolean;
  media: ProductMedia[];
};

export const categories: ProductCategory[] = [
  "Celular",
  "Tablet",
  "Notebook",
  "Relógio",
  "Acessório",
];
