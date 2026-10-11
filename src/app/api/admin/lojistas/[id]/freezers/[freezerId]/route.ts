import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; freezerId: string }> }
) {
  try {
    const session = await requireSession(["ADMIN"]);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { freezerId } = await params;
    const body = await req.json();
    const { lojistaId, location, address, notes, active, brand } = body;

    const freezer = await prisma.freezer.findUnique({ where: { id: freezerId } });
    if (!freezer) {
      return NextResponse.json({ error: "Freezer não encontrado" }, { status: 404 });
    }

    if (lojistaId) {
      const novoLojista = await prisma.lojista.findUnique({ where: { id: lojistaId } });
      if (!novoLojista) {
        return NextResponse.json({ error: "Lojista de destino não encontrado" }, { status: 400 });
      }
    }

    const updated = await prisma.freezer.update({
      where: { id: freezerId },
      data: {
        lojistaId: lojistaId || freezer.lojistaId,
        location: location ?? freezer.location,
        address: address ?? freezer.address,
        notes: notes ?? freezer.notes,
        active: active ?? freezer.active,
        brand: brand ?? freezer.brand,
      },
    });

    return NextResponse.json({ ok: true, freezer: updated });
  } catch (e) {
    console.error("Erro ao atualizar freezer:", e);
    return NextResponse.json({ error: "Erro ao atualizar freezer" }, { status: 500 });
  }
}
