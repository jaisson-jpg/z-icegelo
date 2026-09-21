import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function addNoCache(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");
  return res;
}

export async function GET() {
  const session = await requireSession(["ADMIN"]);
  if (!session) return addNoCache(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));

  try {
    const categories = await prisma.stockCategory.findMany({
      include: { products: true },
      orderBy: { name: "asc" },
    });
    return addNoCache(NextResponse.json(categories));
  } catch (e) {
    console.error(e);
    return addNoCache(NextResponse.json({ error: "Erro ao carregar categorias de estoque" }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return addNoCache(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));

  try {
    const data = await req.json();
    const category = await prisma.stockCategory.create({
      data: {
        name: data.name,
        description: data.description,
        quantity: Number(data.quantity) || 0,
      },
    });
    return addNoCache(NextResponse.json(category));
  } catch (e) {
    console.error(e);
    return addNoCache(NextResponse.json({ error: "Erro ao criar categoria de estoque" }, { status: 500 }));
  }
}
