import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts, saveProducts } from "@/lib/products";
import { parseProduct } from "@/lib/validation";

export async function GET(request: Request) {
  const includeAll = new URL(request.url).searchParams.get("all") === "1";
  if (includeAll && !(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  const products = await getProducts();
  return NextResponse.json(
    includeAll
      ? products
      : products.filter((product) => product.status === "available"),
  );
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }
  const product = parseProduct(await request.json().catch(() => null));
  if (!product) {
    return NextResponse.json({ error: "Confira os campos do aparelho." }, { status: 400 });
  }
  const products = await getProducts();
  await saveProducts([product, ...products]);
  return NextResponse.json(product, { status: 201 });
}
