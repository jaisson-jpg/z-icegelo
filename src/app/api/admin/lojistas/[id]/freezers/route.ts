import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id: lojistaId } = await params;
  const { code, brand, location, address, notes } = await req.json();

  if (!code || !location) {
    return NextResponse.json({ error: "Código e local obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.freezer.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Código de freezer já existe" }, { status: 400 });
  }

  await prisma.freezer.create({
    data: {
      lojistaId,
      code,
      brand: brand || null,
      location,
      address: address || null,
      notes: notes || null,
    },
  });

  return NextResponse.json({ ok: true });
}
