import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const title = (formData.get("title") as string) || null;
  const description = (formData.get("description") as string) || null;
  const linkUrl = (formData.get("linkUrl") as string) || null;
  const image = formData.get("image") as File | null;
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const active = formData.get("active") !== "false";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  let finalImageUrl = imageUrl;
  if (image && image.size > 0) {
    try {
      finalImageUrl = await saveUpload(image, "banners");
    } catch (e) {
      console.error("Erro no upload da imagem:", e);
    }
  }

  if (!finalImageUrl) {
    return NextResponse.json({ error: "Imagem é obrigatória" }, { status: 400 });
  }

  const banner = await prisma.banner.create({
    data: {
      title,
      description,
      imageUrl: finalImageUrl,
      linkUrl,
      active,
      sortOrder,
    },
  });
  return NextResponse.json({ id: banner.id });
}
