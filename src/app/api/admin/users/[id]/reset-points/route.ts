import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Zerar pontos do usuário
    await prisma.user.update({
      where: { id },
      data: { points: 0 }
    });

    // Opcional: Registrar no histórico que foi resetado por um admin
    await prisma.pointTransaction.create({
      data: {
        userId: id,
        amount: -user.points,
        description: `Pontuação zerada pelo administrador (${session.name})`
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao resetar pontos:", error);
    return NextResponse.json({ error: "Erro interno ao resetar pontos" }, { status: 500 });
  }
}
