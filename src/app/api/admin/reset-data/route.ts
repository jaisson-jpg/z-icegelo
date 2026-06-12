import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { resetOnlySales, from, to } = body;

  try {
    if (resetOnlySales) {
      // Zera apenas vendas no período
      const dateFilter: any = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }

      const ordersToDelete = await prisma.order.findMany({
        where: {
          status: "CONFIRMED",
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
        select: { id: true },
      });

      await prisma.orderItem.deleteMany({
        where: { orderId: { in: ordersToDelete.map(o => o.id) } },
      });

      await prisma.order.deleteMany({
        where: {
          id: { in: ordersToDelete.map(o => o.id) },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Vendas do período zeradas com sucesso! ${ordersToDelete.length} pedidos removidos.`,
      });
    } else {
      // Zera tudo
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
        message: "Dados de estoque e financeiro zerados com sucesso!",
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      error: "Erro ao zerar dados"
    }, { status: 500 });
  }
}
