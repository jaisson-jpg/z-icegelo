import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
  return NextResponse.json({
    pixKey: config?.pixKey ?? "47996471803",
    pixHolder: config?.pixHolder ?? "Z-ice Gelo",
    whatsapp: config?.whatsapp ?? "5547996471803",
    pointsPerReal: config?.pointsPerReal ?? 1,
    sacosGratisMeta: config?.sacosGratisMeta ?? 100,
    sacosGratisReward: config?.sacosGratisReward ?? 5,
    instagramUrl: config?.instagramUrl ?? "",
  });
}
