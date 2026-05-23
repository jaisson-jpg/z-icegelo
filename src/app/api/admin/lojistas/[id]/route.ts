import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, hashPassword } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const lojista = await prisma.lojista.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!lojista) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const userUpdate: Record<string, unknown> = {};
  if (body.name) userUpdate.name = body.name;
  if (body.email) userUpdate.email = body.email;
  if (body.phone !== undefined) userUpdate.phone = body.phone;
  if (body.password) userUpdate.passwordHash = await hashPassword(body.password);

  if (Object.keys(userUpdate).length > 0) {
    await prisma.user.update({ where: { id: lojista.userId }, data: userUpdate });
  }

  await prisma.lojista.update({
    where: { id },
    data: {
      businessName: body.businessName,
      cnpj: body.cnpj || null,
      address: body.address,
      city: body.city,
      state: body.state,
      sacosGratisMeta: body.sacosGratisMeta,
      sacosComprados: body.sacosComprados,
      active: body.active,
      notes: body.notes || null,
    },
  });

  return NextResponse.json({ ok: true });
}
