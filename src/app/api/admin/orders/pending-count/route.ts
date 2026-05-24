import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const count = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING_PIX", "AWAITING_CONFIRMATION"]
        }
      }
    });
    
    return NextResponse.json({ count });
  } catch (e) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
