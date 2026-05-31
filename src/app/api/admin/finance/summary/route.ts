import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  try {
    const [sales, investments, products, pendingCount] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: "CONFIRMED",
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
        _sum: { total: true },
      }),
      prisma.investment.aggregate({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
        _sum: { amount: true },
      }),
      prisma.product.findMany({
        where: { active: true },
        select: { stock: true, price: true },
      }),
      prisma.order.count({
        where: { status: { in: ["PENDING_PIX", "AWAITING_CONFIRMATION"] } },
      }),
    ]);

    const totalSales = sales._sum.total || 0;
    const totalInvestments = investments._sum.amount || 0;
    const stockValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

    return NextResponse.json({
      totalSales,
      totalInvestments,
      stockValue,
      pendingOrders: pendingCount,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar resumo financeiro" }, { status: 500 });
  }
}
