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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return addNoCache(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));

  const { id } = await params;
  try {
    const data = await req.json();

    if (data.increment !== undefined) {
      const increment = Number(data.increment);
      if (!Number.isFinite(increment) || increment === 0) {
        return addNoCache(NextResponse.json({ error: "Informe uma quantidade para adicionar" }, { status: 400 }));
      }

      const current = await prisma.stockCategory.findUnique({ where: { id } });
      if (!current) {
        return addNoCache(NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 }));
      }

      const quantity = Math.max(0, current.quantity + Math.trunc(increment));
      const category = await prisma.stockCategory.update({
        where: { id },
        data: { quantity },
      });
      return addNoCache(NextResponse.json(category));
    }

    const updateData: { name?: string; description?: string | null; quantity?: number } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.quantity !== undefined) updateData.quantity = Math.max(0, Number(data.quantity) || 0);

    const category = await prisma.stockCategory.update({
      where: { id },
      data: updateData,
    });
    return addNoCache(NextResponse.json(category));
  } catch (e) {
    console.error(e);
    return addNoCache(NextResponse.json({ error: "Erro ao atualizar categoria de estoque" }, { status: 500 }));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return addNoCache(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));

  const { id } = await params;
  try {
    await prisma.stockCategory.delete({ where: { id } });
    return addNoCache(NextResponse.json({ ok: true }));
  } catch (e) {
    console.error(e);
    return addNoCache(NextResponse.json({ error: "Erro ao excluir categoria de estoque" }, { status: 500 }));
  }
}
