import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { ProductCategory } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    let imageUrl = (formData.get("imageUrl") as string) || product.imageUrl;
    
    if (image && image.size > 0) {
      try {
        imageUrl = await saveUpload(image, "products");
      } catch (e) {
        console.error("Erro no upload da imagem:", e);
      }
    }

    await prisma.product.update({
      where: { id },
      data: {
        name: (formData.get("name") as string)?.trim() || product.name,
        description: formData.has("description")
          ? ((formData.get("description") as string)?.trim() || null)
          : product.description,
        price: formData.has("price") ? parseFloat(formData.get("price") as string) : product.price,
        unit: (formData.get("unit") as string)?.trim() || product.unit,
        category: (formData.get("category") as ProductCategory) || product.category,
        pointsEarn: formData.has("pointsEarn")
          ? parseInt(formData.get("pointsEarn") as string)
          : product.pointsEarn,
        sortOrder: formData.has("sortOrder")
          ? parseInt(formData.get("sortOrder") as string)
          : product.sortOrder,
        stock: formData.has("stock") ? parseInt(formData.get("stock") as string) : product.stock,
        sacosPerUnit: formData.has("sacosPerUnit")
          ? parseInt(formData.get("sacosPerUnit") as string) || 1
          : product.sacosPerUnit,
        active: formData.get("active") === "true",
        imageUrl,
      },
    });
  } else {
    const body = await req.json();
    await prisma.product.update({
      where: { id },
      data: {
        name: body.name?.trim() ?? product.name,
        description: body.description !== undefined ? (body.description?.trim() || null) : product.description,
        price: body.price !== undefined ? Number(body.price) : product.price,
        unit: body.unit?.trim() ?? product.unit,
        category: body.category ?? product.category,
        pointsEarn: body.pointsEarn !== undefined ? Number(body.pointsEarn) : product.pointsEarn,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : product.sortOrder,
        stock: body.stock !== undefined ? Number(body.stock) : product.stock,
        active: body.active !== undefined ? Boolean(body.active) : product.active,
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
  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  if (product._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true, deactivated: true });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
