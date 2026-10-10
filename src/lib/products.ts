import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { initialProducts } from "./seed";
import type { Product } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const productsFile = path.join(dataDirectory, "products.json");
let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(productsFile, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    await writeFile(productsFile, JSON.stringify(initialProducts, null, 2), "utf8");
  }
}

export async function getProducts(): Promise<Product[]> {
  await ensureDataFile();
  const contents = await readFile(productsFile, "utf8");
  const products: unknown = JSON.parse(contents);
  if (!Array.isArray(products)) {
    throw new Error("O arquivo local de produtos contém dados inválidos.");
  }
  return products as Product[];
}

export async function saveProducts(products: Product[]): Promise<void> {
  const operation = writeQueue.then(async () => {
    await ensureDataFile();
    const temporaryFile = path.join(dataDirectory, `products.${crypto.randomUUID()}.tmp`);
    await writeFile(temporaryFile, JSON.stringify(products, null, 2), "utf8");
    await rename(temporaryFile, productsFile);
  });
  writeQueue = operation.catch(() => undefined);
  await operation;
}
