import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    // Verificar se existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Excluir usuário (as relações como orders e pointHistory serão tratadas pelo onDelete: Cascade se configurado no schema)
    // No nosso schema, PointTransaction tem Cascade, mas Order NÃO tem (por segurança).
    // Precisamos desvincular ou excluir as ordens primeiro se quisermos deletar o usuário.
    
    // Opção segura: Desvincular ordens (colocar userId como null) em vez de apagar o histórico de vendas
    await prisma.order.updateMany({
      where: { userId: id },
      data: { userId: null }
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json({ error: "Erro interno ao deletar usuário" }, { status: 500 });
  }
}
