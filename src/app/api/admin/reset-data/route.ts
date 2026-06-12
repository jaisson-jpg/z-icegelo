import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Zera estoque das categorias
    await prisma.stockCategory.updateMany({
      data: { quantity: 0 },
    });

    // Zera estoque dos produtos
    await prisma.product.updateMany({
      data: { stock: 0 },
    });

    // Zera investimentos
    await prisma.investment.deleteMany();

    // Reseta dados dos lojistas (sacos comprados, etc.)
    await prisma.lojista.updateMany({
      data: {
        sacosComprados: 0,
        sacosGratis: 0,
        totalSacosHistorico: 0,
      },
    });

    // Reseta pontos dos clientes
    await prisma.user.updateMany({
      data: { points: 0 },
    });

    // Apaga histórico de pontos
    await prisma.pointTransaction.deleteMany();

    return NextResponse.json({
      success: true,
      message: "Dados de estoque e financeiro zerados com sucesso!"
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      error: "Erro ao zerar dados"
    }, { status: 500 });
  }
}
