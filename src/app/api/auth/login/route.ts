import { NextResponse } from "next/server";
import { createAdminSession, passwordMatches } from "@/lib/auth";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const password =
    body && typeof body === "object" && "password" in body && typeof body.password === "string"
      ? body.password
      : "";

  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ authenticated: true });
}
