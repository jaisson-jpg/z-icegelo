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

  // Se estivermos no Netlify ou Vercel, o sistema de arquivos é somente leitura.
  // Usamos Base64 para salvar direto no banco de dados.
  if (process.env.NETLIFY || process.env.VERCEL || process.env.NODE_ENV === "production") {
    const base64 = buffer.toString("base64");
    const mimeType = file.type || `image/${ext}`;
    return `data:${mimeType};base64,${base64}`;
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    const base = subfolder ? `/uploads/${subfolder}` : "/uploads";
    return `${base}/${filename}`;
  } catch (e) {
    // Fallback para Base64 se falhar ao escrever no disco (ex: permissão no servidor)
    const base64 = buffer.toString("base64");
    const mimeType = file.type || `image/${ext}`;
    return `data:${mimeType};base64,${base64}`;
  }
}
