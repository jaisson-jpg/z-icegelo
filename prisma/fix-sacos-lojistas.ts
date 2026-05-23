/**
 * Corrige pedidos confirmados de lojistas que receberam pontos mas não sacos.
 * Execute: npx tsx prisma/fix-sacos-lojistas.ts
 */
import { PrismaClient } from "@prisma/client";
import { applyLoyaltyToOrder } from "../src/lib/loyalty";

const prisma = new PrismaClient();

async function main() {
  const lojistaUserIds = (
    await prisma.lojista.findMany({ select: { userId: true } })
  ).map((l) => l.userId);

  const orders = await prisma.order.findMany({
    where: {
      status: "CONFIRMED",
      sacosCredited: 0,
      userId: { in: lojistaUserIds },
    },
    include: { items: { include: { product: true } } },
  });

  console.log(`Corrigindo ${orders.length} pedidos de lojistas sem sacos...\n`);

  for (const order of orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { loyaltyApplied: false },
    });

    const fresh = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });
    if (!fresh) continue;

    const result = await applyLoyaltyToOrder(fresh);
    console.log(
      `✓ ${order.orderNumber} | ${order.customerName} → +${result.sacosCredited} sacos (pts já tinha)`
    );
  }

  console.log("\n--- Estado dos lojistas ---");
  const lojistas = await prisma.lojista.findMany({ include: { user: true } });
  for (const l of lojistas) {
    console.log(
      `  ${l.businessName}: barra ${l.sacosComprados}/${l.sacosGratisMeta} | histórico ${l.totalSacosHistorico} | ${l.user.points} pts`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
