import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { ProductCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const price = parseFloat(formData.get("price") as string);
  const unit = (formData.get("unit") as string) || "saco";
  const category = formData.get("category") as string;
  const pointsEarn = parseInt(formData.get("pointsEarn") as string) || Math.round(price);
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const sacosPerUnit = parseInt(formData.get("sacosPerUnit") as string) || 1;
  const active = formData.get("active") !== "false";
  const image = formData.get("image") as File | null;

  if (!name || isNaN(price) || price < 0 || !category) {
    return NextResponse.json({ error: "Nome, preço e categoria são obrigatórios" }, { status: 400 });
  }

  let imageUrl = (formData.get("imageUrl") as string) || null;
  if (image && image.size > 0) {
    try {
      imageUrl = await saveUpload(image, "products");
    } catch (e) {
      console.error("Erro no upload da imagem:", e);
    }
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price,
      unit: unit.trim(),
      category: category as ProductCategory,
      pointsEarn,
      sortOrder,
      stock,
      sacosPerUnit,
      active,
      imageUrl,
    },
  });

  return NextResponse.json({ id: product.id });
}
