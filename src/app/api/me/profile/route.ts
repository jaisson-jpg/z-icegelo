import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { lojista: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const lojista = user.lojista;
  const addressParts = lojista
    ? [lojista.address, lojista.city, lojista.state].filter(Boolean).join(", ")
    : "";

  return NextResponse.json({
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    points: user.points,
    lojista: lojista
      ? {
          businessName: lojista.businessName,
          cnpj: lojista.cnpj,
          address: addressParts,
          sacosComprados: lojista.sacosComprados,
          sacosGratisMeta: lojista.sacosGratisMeta,
          sacosGratis: lojista.sacosGratis,
          totalSacosHistorico: lojista.totalSacosHistorico,
        }
      : null,
    checkoutDefaults: {
      customerName: lojista?.businessName || user.name,
      customerPhone: user.phone || "",
      customerEmail: user.email || "",
      address: addressParts,
      customerCpfCnpj: lojista?.cnpj || "",
      needsInvoice: !!lojista?.cnpj,
    },
  });
}
