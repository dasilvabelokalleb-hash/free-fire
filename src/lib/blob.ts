import "server-only";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import type { Product } from "./types";

const productsPath = "products.json";

export function usesVercelBlobStorage() {
  return process.env.VERCEL === "1" || Boolean(process.env.BLOB_STORE_ID);
}

export function usesVercelCatalogStorage() {
  return process.env.VERCEL === "1" || Boolean(process.env.CATALOG_BLOB_STORE_ID);
}

function requireCatalogStore() {
  const storeId = process.env.CATALOG_BLOB_STORE_ID;
  const token = process.env.CATALOG_BLOB_READ_WRITE_TOKEN;
  if (!storeId || !token) {
    throw new Error(
      "CATALOG_BLOB_STORE_ID e CATALOG_BLOB_READ_WRITE_TOKEN devem ser configurados.",
    );
  }
  return { storeId, token };
}

export async function readBlobProducts(): Promise<unknown | null> {
  const blob = await get(productsPath, {
    access: "private",
    useCache: false,
    ...requireCatalogStore(),
  });
  if (!blob) return null;
  return new Response(blob.stream).json();
}

export async function initializeBlobProducts(products: Product[]) {
  const catalogStore = requireCatalogStore();
  try {
    await put(productsPath, JSON.stringify(products, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: 60,
      contentType: "application/json",
      ...catalogStore,
    });
    return true;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return false;
    throw error;
  }
}

export async function saveBlobProducts(products: Product[]) {
  const catalogStore = requireCatalogStore();
  await put(productsPath, JSON.stringify(products, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json",
    ...catalogStore,
  });
}
