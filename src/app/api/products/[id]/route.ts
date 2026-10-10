import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts, saveProducts } from "@/lib/products";
import { parseProduct } from "@/lib/validation";
import type { Product } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  const { id } = await context.params;
  const products = await getProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Aparelho não encontrado." }, { status: 404 });
  }
  const product = parseProduct(await request.json().catch(() => null), products[index]);
  if (!product) {
    return NextResponse.json({ error: "Confira os campos do aparelho." }, { status: 400 });
  }
  const updatedProducts = [...products];
  updatedProducts[index] = product;
  await saveProducts(updatedProducts);
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  const { id } = await context.params;
  const products = await getProducts();
  const updatedProducts = products.filter((product) => product.id !== id);
  if (updatedProducts.length === products.length) {
    return NextResponse.json({ error: "Aparelho não encontrado." }, { status: 404 });
  }
  await saveProducts(updatedProducts);
  return NextResponse.json({ deleted: true });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const products = await getProducts();
  const product = products.find(
    (item: Product) => item.id === id && item.status === "available",
  );
  if (!product) {
    return NextResponse.json({ error: "Aparelho não encontrado." }, { status: 404 });
  }
  return NextResponse.json(product);
}
