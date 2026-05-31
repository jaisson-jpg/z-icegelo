import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const [pendingOrders, totalCustomers] = await Promise.all([
      prisma.order.count({
        where: {
          status: {
            in: ["PENDING_PIX", "AWAITING_CONFIRMATION"]
          }
        }
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER"
        }
      })
    ]);
    
    return NextResponse.json({ 
      pendingOrders,
      totalCustomers
    });
  } catch (e) {
    return NextResponse.json({ pendingOrders: 0, totalCustomers: 0 }, { status: 500 });
  }
}
