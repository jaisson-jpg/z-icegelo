import type { Prisma, Product, Order, OrderItem } from "@prisma/client";
import { getWeekStart } from "./utils";
import { prisma } from "./prisma";

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function getSacosPerUnit(product: Pick<Product, "name" | "sacosPerUnit">) {
  // Se estiver explicitamente configurado com mais de 1 saco, confiamos no campo
  if (product.sacosPerUnit && product.sacosPerUnit > 1) {
    return product.sacosPerUnit;
  }
  
  // Regex para pegar números antes de palavras-chave que indiquem múltiplos sacos
  // Pega: "20 sacos", "20un", "Pacote 20", "20 unidades", "Pacote com 20"
  // REMOVIDO "kg" pois gelo de 10kg é apenas 1 saco, não 10.
  const name = product.name.toLowerCase();
  const match = name.match(/(\d+)\s*(sacos?|un|unidades?|pacote|com)/i);
  if (match) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  
  // Se for atacado e tiver um número no nome, provavelmente é a quantidade de sacos
  // mas evitamos pegar "2kg", "5kg", "10kg" etc.
  if (name.includes("atacado")) {
    const simpleMatch = name.match(/(\d+)/);
    if (simpleMatch) {
      const val = parseInt(simpleMatch[1], 10);
      // Evitamos 2, 5, 10 que são pesos comuns de sacos individuais
      if (!isNaN(val) && val > 1 && val !== 2 && val !== 5 && val !== 10) return val;
    }
  }
  
  // Fallback para o valor configurado ou 1
  return product.sacosPerUnit || 1;
}

export function countSacosFromItems(
  items: Array<{ quantity: number; product: Pick<Product, "name" | "sacosPerUnit"> }>
) {
  return items.reduce(
    (sum, item) => sum + item.quantity * getSacosPerUnit(item.product),
    0
  );
}

type Tx = Prisma.TransactionClient;

export async function applyLojistaSacos(tx: Tx, lojistaId: string, sacosAdded: number) {
  if (sacosAdded === 0) return { sacosAdded: 0, sacosGratisEarned: 0 };

  const lojista = await tx.lojista.findUnique({ where: { id: lojistaId } });
  if (!lojista) return { sacosAdded: 0, sacosGratisEarned: 0 };

  const config = await tx.siteConfig.findUnique({ where: { id: "main" } });
  const reward = lojista.sacosGratisReward || config?.sacosGratisReward || 5;

  const newTotal = lojista.sacosComprados + sacosAdded;
  let sacosGratis = lojista.sacosGratis;
  let remaining = newTotal;
  const meta = lojista.sacosGratisMeta;
  const sacosGratisBefore = lojista.sacosGratis;

  // Se o total for positivo, processamos ganhos de brindes
  if (remaining >= meta) {
    while (remaining >= meta) {
      remaining -= meta;
      sacosGratis += reward;
    }
  } else if (remaining < 0) {
    // Se o total for negativo (ajuste para baixo), mantemos o saldo mínimo de 0
    // mas não tiramos brindes já ganhos para evitar confusão
    remaining = 0;
  }

  await tx.lojista.update({
    where: { id: lojistaId },
    data: {
      sacosComprados: remaining,
      sacosGratis,
      totalSacosHistorico: { increment: sacosAdded },
    },
  });

  const weekStart = getWeekStart();
  await tx.weeklyPurchase.upsert({
    where: { lojistaId_weekStart: { lojistaId, weekStart } },
    create: { lojistaId, weekStart, sacosCount: sacosAdded },
    update: { sacosCount: { increment: sacosAdded } },
  });

  return { sacosAdded, sacosGratisEarned: sacosGratis - sacosGratisBefore };
}

export async function applyUserPoints(
  tx: Tx,
  userId: string,
  points: number,
  orderId: string,
  orderNumber: string
) {
  if (points <= 0) return false;

  const existing = await tx.pointTransaction.findFirst({
    where: { orderId, userId },
  });
  if (existing) return false;

  await tx.user.update({
    where: { id: userId },
    data: { points: { increment: points } },
  });

  await tx.pointTransaction.create({
    data: {
      userId,
      amount: points,
      description: `Compra ${orderNumber}`,
      orderId,
    },
  });
  return true;
}

export async function findLojistaForOrder(
  tx: Tx | typeof prisma,
  userId: string | null | undefined,
  customerPhone: string
) {
  if (userId) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { lojista: true },
    });
    if (user?.role === "LOJISTA" && user.lojista?.active) {
      return { ...user.lojista, user };
    }
    const byUser = await tx.lojista.findFirst({
      where: { userId, active: true },
      include: { user: true },
    });
    if (byUser) return byUser;
  }

  const digits = normalizePhone(customerPhone);
  if (digits.length < 8) return null;

  const users = await tx.user.findMany({
    where: { role: "LOJISTA" },
    include: { lojista: true },
  });

  for (const u of users) {
    if (!u.lojista?.active || !u.phone) continue;
    const userDigits = normalizePhone(u.phone);
    if (
      userDigits === digits ||
      (userDigits.length >= 8 &&
        digits.length >= 8 &&
        (userDigits.endsWith(digits.slice(-8)) || digits.endsWith(userDigits.slice(-8))))
    ) {
      return { ...u.lojista, user: u };
    }
  }

  return null;
}

type OrderWithItems = Order & {
  items: Array<OrderItem & { product: Product }>;
};

/** Aplica pontos e sacos — pode rodar de novo se sacos ainda não foram creditados */
export async function applyLoyaltyToOrder(order: OrderWithItems) {
  return prisma.$transaction(async (tx) => {
    let linkedUserId = order.userId;
    const lojistaPreview = await findLojistaForOrder(tx, order.userId, order.customerPhone);
    if (!linkedUserId && lojistaPreview) {
      linkedUserId = lojistaPreview.userId;
      await tx.order.update({ where: { id: order.id }, data: { userId: linkedUserId } });
    }

    const effectiveUserId = linkedUserId ?? order.userId;
    let pointsCredited = 0;
    let sacosCredited = order.sacosCredited ?? 0;
    let sacosGratisEarned = 0;

    if (effectiveUserId && order.pointsAwarded > 0) {
      const applied = await applyUserPoints(
        tx,
        effectiveUserId,
        order.pointsAwarded,
        order.id,
        order.orderNumber
      );
      if (applied) pointsCredited = order.pointsAwarded;
    }

    const lojista = await findLojistaForOrder(tx, effectiveUserId, order.customerPhone);

    // Se for um lojista e ou ainda não tem sacos creditados, ou estamos forçando a atualização
    // Isso permite corrigir pedidos que foram creditados com a quantidade errada anteriormente
    if (lojista) {
      const currentSacos = countSacosFromItems(order.items);
      
      // Se ainda não creditou OU se o valor calculado mudou (ajuste)
      if (order.sacosCredited === 0 || currentSacos !== order.sacosCredited) {
        const diff = currentSacos - (order.sacosCredited || 0);
        
        if (diff !== 0) {
          const sacosResult = await applyLojistaSacos(tx, lojista.id, diff);
          // O total creditado neste pedido passa a ser o valor correto calculado agora
          sacosCredited = currentSacos;
          sacosGratisEarned = sacosResult.sacosGratisEarned;
        }
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        loyaltyApplied: true,
        sacosCredited,
        userId: effectiveUserId ?? order.userId,
      },
    });

    return {
      pointsCredited,
      sacosCredited,
      sacosGratisEarned,
      linkedUserId: effectiveUserId,
      lojistaFound: !!lojista,
      alreadyHadSacos: (order.sacosCredited ?? 0) > 0,
    };
  });
}
