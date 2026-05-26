import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, hashPassword } from "@/lib/auth";
export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { businessName, name, email, phone, password, cnpj, address, city, state, sacosGratisMeta, sacosGratisReward, notes } = body;

  if (!businessName || !name || !email || !password || !address) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "E-mail já em uso" }, { status: 400 });
  }

  const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      role: "LOJISTA",
    },
  });

  const lojista = await prisma.lojista.create({
    data: {
      userId: user.id,
      businessName,
      cnpj: cnpj || null,
      address,
      city: city || "Guaramirim",
      state: state || "SC",
      sacosGratisMeta: sacosGratisMeta || config?.sacosGratisMeta || 100,
      sacosGratisReward: sacosGratisReward || config?.sacosGratisReward || 5,
      notes: notes || null,
    },
  });

  return NextResponse.json({ id: lojista.id });
}
