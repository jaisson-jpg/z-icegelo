import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { getWeekStart } from "@/lib/utils";

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

  const weekStart = getWeekStart();
  const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
  const reward = config?.sacosGratisReward ?? 5;

  await prisma.$transaction(async (tx) => {
    await tx.weeklyPurchase.upsert({
      where: { lojistaId_weekStart: { lojistaId, weekStart } },
      create: { lojistaId, weekStart, sacosCount },
      update: { sacosCount: { increment: sacosCount } },
    });

    const newTotal = lojista.sacosComprados + sacosCount;
    let sacosGratis = lojista.sacosGratis;
    let remaining = newTotal;
    const meta = lojista.sacosGratisMeta;

    while (remaining >= meta) {
      remaining -= meta;
      sacosGratis += reward;
    }

    await tx.lojista.update({
      where: { id: lojistaId },
      data: {
        sacosComprados: remaining,
        sacosGratis,
        totalSacosHistorico: { increment: sacosCount },
      },
    });
  });

  return NextResponse.json({ ok: true });
}
