import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "bello_admin_session";
const sessionDurationSeconds = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET deve conter pelo menos 32 caracteres.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function secureEquals(left: string, right: string) {
  const leftHash = createHmac("sha256", getSessionSecret()).update(left).digest();
  const rightHash = createHmac("sha256", getSessionSecret()).update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function passwordMatches(password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  return Boolean(configuredPassword && secureEquals(password, configuredPassword));
}

export async function createAdminSession() {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", expires: Date.now() + sessionDurationSeconds * 1000 }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  try {
    if (!secureEquals(signature, sign(payload))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: string;
      expires?: number;
    };
    return data.role === "admin" && typeof data.expires === "number" && data.expires > Date.now();
  } catch {
    return false;
  }
}
