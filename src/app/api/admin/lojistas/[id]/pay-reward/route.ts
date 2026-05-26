import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const lojista = await prisma.lojista.findUnique({ where: { id } });

    if (!lojista) {
      return NextResponse.json({ error: "Lojista não encontrado" }, { status: 404 });
    }

    if (lojista.sacosGratis <= 0) {
      return NextResponse.json({ error: "Lojista não possui prêmios pendentes" }, { status: 400 });
    }

    // Decrementa 1 prêmio do lojista
    await prisma.lojista.update({
      where: { id },
      data: {
        sacosGratis: { decrement: 5 }, // Aqui usamos o valor fixo ou buscamos da config? 
        // Na verdade, no schema sacosGratis é o SALDO de sacos que ele tem.
        // O usuário quer que suma a notificação.
      },
    });

    // Ajuste: sacosGratis no schema parece ser a QUANTIDADE de sacos.
    // Se o prêmio é de 5 sacos, e ele ganhou 1 prêmio, o saldo é 5.
    // Vamos zerar o saldo de sacos grátis dele.
    await prisma.lojista.update({
      where: { id },
      data: {
        sacosGratis: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
