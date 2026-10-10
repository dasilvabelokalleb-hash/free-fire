import { categories, type Product, type ProductMedia } from "./types";

const maxTitleLength = 100;
const maxDescriptionLength = 2400;

export function parseProduct(input: unknown, existing?: Product): Product | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const category = value.category;
  const price = Number(value.price);
  const condition = typeof value.condition === "string" ? value.condition.trim() : "";
  const description =
    typeof value.description === "string" ? value.description.trim() : "";
  const battery =
    value.battery === "" || value.battery === null || value.battery === undefined
      ? undefined
      : Number(value.battery);
  const status = value.status;
  const specs = Array.isArray(value.specs)
    ? value.specs
        .filter((spec): spec is string => typeof spec === "string")
        .map((spec) => spec.trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];
  const media = value.media;

  if (
    !name ||
    name.length > maxTitleLength ||
    !categories.includes(category as (typeof categories)[number]) ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 100_000_000 ||
    !condition ||
    condition.length > 50 ||
    description.length > maxDescriptionLength ||
    (battery !== undefined &&
      (!Number.isInteger(battery) || battery < 0 || battery > 100)) ||
    (status !== "available" && status !== "sold") ||
    !Array.isArray(media) ||
    media.length > 12 ||
    !media.every(isProductMedia)
  ) {
    return null;
  }

  return {
    id: existing?.id ?? crypto.randomUUID(),
    name,
    category: category as Product["category"],
    price: Math.round(price * 100) / 100,
    condition,
    battery,
    description,
    specs,
    status,
    featured: value.featured === true,
    media,
  };
}

function isProductMedia(value: unknown): value is ProductMedia {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.type === "image" || item.type === "video") &&
    typeof item.src === "string" &&
    item.src.length < 2048 &&
    (item.src.startsWith("https://images.unsplash.com/") ||
      item.src.startsWith("https://") ||
      /^\/uploads\/[a-f0-9-]{36}\.(jpg|jpeg|png|webp|mp4)$/i.test(item.src))
  );
}
