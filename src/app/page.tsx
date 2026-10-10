import { Catalog } from "@/components/catalog";
import { getProducts } from "@/lib/products";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const products = (await getProducts()).filter(
    (product) => product.status === "available",
  );

  return <Catalog products={products} />;
}
