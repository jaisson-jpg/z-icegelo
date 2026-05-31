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
      userId: { in: lojistaUserIds },
    },
    include: { items: { include: { product: true } } },
  });

  console.log(`Verificando fidelidade de ${orders.length} pedidos de lojistas...\n`);

  for (const order of orders) {
    const result = await applyLoyaltyToOrder(order);
    if (result.sacosCredited !== order.sacosCredited) {
      console.log(
        `✓ ${order.orderNumber} | ${order.customerName} → Ajustado de ${order.sacosCredited} para ${result.sacosCredited} sacos`
      );
    }
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
