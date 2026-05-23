import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();

  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: body,
    create: { id: "main", ...body },
  });

  return NextResponse.json({ ok: true });
}
