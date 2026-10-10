import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

const maxFileSize = 25 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
};

export async function POST(request: Request) {
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
