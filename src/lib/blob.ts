import "server-only";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import type { Product } from "./types";

const productsPath = "products.json";

export function usesVercelBlobStorage() {
  return process.env.VERCEL === "1" || Boolean(process.env.BLOB_STORE_ID);
}

function requireBlobStore() {
  if (!process.env.BLOB_STORE_ID) {
    throw new Error("BLOB_STORE_ID não está configurado para o armazenamento de produção.");
  }
}

export async function readBlobProducts(): Promise<unknown | null> {
  requireBlobStore();
  const blob = await get(productsPath, { access: "public", useCache: false });
  if (!blob) return null;
  return new Response(blob.stream).json();
}

export async function initializeBlobProducts(products: Product[]) {
  requireBlobStore();
  try {
    await put(productsPath, JSON.stringify(products, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: 60,
      contentType: "application/json",
    });
    return true;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return false;
    throw error;
  }
}

export async function saveBlobProducts(products: Product[]) {
  requireBlobStore();
  await put(productsPath, JSON.stringify(products, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json",
  });
}
