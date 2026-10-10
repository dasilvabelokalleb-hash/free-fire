import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { handleUpload } from "@vercel/blob/client";
import type { HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { usesVercelBlobStorage } from "@/lib/blob";

const maxFileSize = 25 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
};

export async function GET() {
  return NextResponse.json({ clientUploads: usesVercelBlobStorage() });
}

export async function POST(request: Request) {
  if (usesVercelBlobStorage()) {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Envie os arquivos diretamente para o armazenamento de mídia." },
        { status: 400 },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    if (
      !body ||
      typeof body !== "object" ||
      !("type" in body) ||
      (body.type !== "blob.generate-client-token" && body.type !== "blob.upload-completed")
    ) {
      return NextResponse.json({ error: "Requisição de upload inválida." }, { status: 400 });
    }
    if (body.type === "blob.generate-client-token" && !(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const result = await handleUpload({
      body: body as HandleUploadBody,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdminAuthenticated())) {
          throw new Error("Acesso não autorizado.");
        }
        const extension = path.extname(pathname).toLowerCase();
        if (
          !pathname.startsWith("uploads/") ||
          !Object.values(allowedTypes).includes(extension)
        ) {
          throw new Error("Tipo de arquivo não permitido.");
        }
        return {
          allowedContentTypes: Object.keys(allowedTypes),
          maximumSizeInBytes: maxFileSize,
          addRandomSuffix: true,
          validUntil: Date.now() + 60 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files");
  if (files.length === 0 || files.length > 8) {
    return NextResponse.json(
      { error: "Selecione de 1 a 8 fotos ou vídeos por envio." },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (
      !(file instanceof File) ||
      !allowedTypes[file.type] ||
      file.size === 0 ||
      file.size > maxFileSize
    ) {
      return NextResponse.json(
        { error: "Use fotos JPG, PNG, WEBP ou vídeos MP4 de até 25 MB cada." },
        { status: 400 },
      );
    }
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const media = await Promise.all(
    files.map(async (entry) => {
      const file = entry as File;
      const extension = allowedTypes[file.type];
      const fileName = `${randomUUID()}${extension}`;
      await writeFile(
        path.join(uploadDirectory, fileName),
        Buffer.from(await file.arrayBuffer()),
        { flag: "wx" },
      );
      return {
        type: file.type === "video/mp4" ? ("video" as const) : ("image" as const),
        src: `/uploads/${fileName}`,
      };
    }),
  );

  return NextResponse.json({ media }, { status: 201 });
}
