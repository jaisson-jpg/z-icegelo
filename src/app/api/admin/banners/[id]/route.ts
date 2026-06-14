import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({
    where: { id },
  });
  if (!banner) return NextResponse.json({ error: "Banner não encontrado" }, { status: 404 });
  return NextResponse.json(banner);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ error: "Banner não encontrado" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    let imageUrl = (formData.get("imageUrl") as string) || banner.imageUrl;

    if (image && image.size > 0) {
      try {
        imageUrl = await saveUpload(image, "banners");
      } catch (e) {
        console.error("Erro no upload da imagem:", e);
      }
    }

    await prisma.banner.update({
      where: { id },
      data: {
        title: formData.has("title") ? (formData.get("title") as string) || null : banner.title,
        description: formData.has("description") ? (formData.get("description") as string) || null : banner.description,
        linkUrl: formData.has("linkUrl") ? (formData.get("linkUrl") as string) || null : banner.linkUrl,
        active: formData.get("active") === "true",
        sortOrder: formData.has("sortOrder") ? parseInt(formData.get("sortOrder") as string) : banner.sortOrder,
        imageUrl,
      },
    });
  } else {
    const body = await req.json();
    await prisma.banner.update({
      where: { id },
      data: {
        title: body.title !== undefined ? (body.title || null) : banner.title,
        description: body.description !== undefined ? (body.description || null) : banner.description,
        linkUrl: body.linkUrl !== undefined ? (body.linkUrl || null) : banner.linkUrl,
        active: body.active !== undefined ? Boolean(body.active) : banner.active,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : banner.sortOrder,
        imageUrl: body.imageUrl || banner.imageUrl,
      },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.banner.delete({
    where: { id },
  });
  return NextResponse.json({ ok: true });
}
