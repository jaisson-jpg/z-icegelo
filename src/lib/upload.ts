import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveUpload(file: File, subfolder = ""): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) {
    throw new Error("Formato de imagem não permitido");
  }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  const base = subfolder ? `/uploads/${subfolder}` : "/uploads";
  return `${base}/${filename}`;
}
