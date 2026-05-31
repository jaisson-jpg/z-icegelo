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
    const investments = await prisma.investment.findMany({
      where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
      orderBy: { date: "desc" },
    });

    return NextResponse.json(investments);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar investimentos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, amount, category, description, date } = body;

    if (!name || !amount) {
      return NextResponse.json({ error: "Nome e valor são obrigatórios" }, { status: 400 });
    }

    const investment = await prisma.investment.create({
      data: {
        name,
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(investment);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar investimento" }, { status: 500 });
  }
}
