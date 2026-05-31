import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { applyLojistaSacos } from "@/lib/loyalty";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id: lojistaId } = await params;
  const { sacosCount } = await req.json();

  if (!sacosCount || sacosCount < 1) {
    return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });
  }

  const lojista = await prisma.lojista.findUnique({ where: { id: lojistaId } });
  if (!lojista) return NextResponse.json({ error: "Lojista não encontrado" }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      await applyLojistaSacos(tx, lojistaId, sacosCount);
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro ao registrar compra semanal:", e);
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
  }
}
