import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const categories = await prisma.stockCategory.findMany({
      include: { products: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao carregar categorias de estoque" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const data = await req.json();
    const category = await prisma.stockCategory.create({
      data: {
        name: data.name,
        description: data.description,
        quantity: Number(data.quantity) || 0,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar categoria de estoque" }, { status: 500 });
  }
}
