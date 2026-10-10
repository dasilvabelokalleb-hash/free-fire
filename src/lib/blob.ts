import "server-only";
import { randomUUID } from "node:crypto";
import { BlobPreconditionFailedError, put } from "@vercel/blob";
import type { Product } from "./types";

const productsPath = "products.json";

export function usesVercelBlobStorage() {
  return process.env.VERCEL === "1" || Boolean(process.env.BLOB_STORE_ID);
}

function requireBlobStore() {
  const storeId = process.env.BLOB_STORE_ID;
  if (!storeId) {
    throw new Error("BLOB_STORE_ID não está configurado para o armazenamento de produção.");
  }
  return storeId;
}

export async function readBlobProducts(): Promise<unknown | null> {
  const publicStoreId = requireBlobStore().replace(/^store_/i, "").toLowerCase();
  const url = new URL(
    `https://${publicStoreId}.public.blob.vercel-storage.com/${productsPath}`,
  );
  url.searchParams.set("version", randomUUID());

  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Falha ao ler o catálogo remoto (HTTP ${response.status}).`);
  }
  return response.json();
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
