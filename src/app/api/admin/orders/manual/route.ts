import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { requireSession } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/invoice";
import { applyLoyaltyToOrder, normalizePhone } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      userId,             // opcional: id do user/lojista existente
      customerName,
      customerPhone,
      customerEmail,
      customerCpfCnpj,
      address,
      deliveryFee = 0,
      needsInvoice = false,
      note,
      items,              // [{productId, quantity, unitPrice}]
      createAndConfirm,   // se true: cria CONFIRMED, baixa estoque, aplica fidelidade TUDO
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: "Nome, telefone e pelo menos 1 item são obrigatórios" }, { status: 400 });
    }

    // 1) Buscar o usuário se tiver userId
    let user: any = null;
    let userIdFinal: string | null = userId || null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { lojista: true },
      });
      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }
    } else {
      // Tenta encontrar por telefone normalizado (auto-vincular lojista)
      const normalized = normalizePhone(customerPhone);
      if (normalized && normalized.length >= 8) {
        const foundByPhone = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: normalized },
              { phone: { contains: normalized.slice(-8) } },
            ],
          },
          include: { lojista: true },
        });
        if (foundByPhone) {
          user = foundByPhone;
          userIdFinal = foundByPhone.id;
        }
      }
    }

    const isLojista = !!user?.lojista;

    // 2) Validar produtos e calcular total
    let total = 0;
    const orderItems: Array<{
      productId: string;
      name: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];
    let pointsAwarded = 0;

    const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
    const pointsPerReal = config?.pointsPerReal ?? 1;

    for (const rawItem of items) {
      const product = await prisma.product.findUnique({
        where: { id: rawItem.productId },
        include: { stockCategory: true },
      });
      if (!product) {
        return NextResponse.json({ error: `Produto não encontrado: ${rawItem.productId}` }, { status: 404 });
      }
      const qty = Math.max(1, parseInt(rawItem.quantity || 1));
      const price = parseFloat(rawItem.unitPrice || product.price || 0);
      const subtotal = price * qty;
      total += subtotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        unitPrice: price,
        quantity: qty,
        subtotal,
      });

      // Cálculo de pontos
      const itemPoints = (product.pointsEarn || 0) > 0
        ? product.pointsEarn * qty
        : Math.floor(subtotal * pointsPerReal);
      pointsAwarded += itemPoints;
    }

    total += deliveryFee;

    // 3) Preparar status
    const initialStatus = createAndConfirm ? "CONFIRMED" : "AWAITING_CONFIRMATION";
    const orderNumber = generateOrderNumber();
    const category = items.some((i: any) => {
      const p = orderItems.find((oi) => oi.productId === i.productId);
      return i.category === "ATACADO";
    }) ? "ATACADO" : items.some((i: any) => i.category?.toUpperCase?.() === "ATACADO") ? "ATACADO" : (isLojista ? "ATACADO" : "VAREJO");

    const invoiceData: Record<string, any> = {};
    if (createAndConfirm && needsInvoice) {
      invoiceData.invoiceNumber = generateInvoiceNumber();
      invoiceData.invoiceIssuedAt = new Date();
    }

    // 4) Criar o pedido
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userIdFinal,
        customerName,
        customerPhone: normalizePhone(customerPhone) || customerPhone,
        customerEmail: customerEmail || user?.email || null,
        customerCpfCnpj: customerCpfCnpj ? customerCpfCnpj.replace(/\D/g, "") : (user?.lojista?.cnpj || null),
        address: address || (user?.lojista?.address || null),
        category,
        total,
        deliveryFee,
        needsInvoice,
        status: initialStatus,
        note: note || null,
        pointsAwarded,
        ...(createAndConfirm ? { confirmedAt: new Date() } : {}),
        ...invoiceData,
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: { include: { lojista: true } },
      },
    });

    // 5) SE createAndConfirm=true: baixa estoque E aplica fidelidade (o equivalente ao botão "Confirmar")
    let loyaltyResult: any = null;
    if (createAndConfirm) {
      for (const item of order.items) {
        const product = item.product;
        const totalSacadosPedidos = item.quantity * (product.sacosPerUnit || 1);
        if (product.stockCategoryId) {
          await prisma.stockCategory.update({
            where: { id: product.stockCategoryId },
            data: { quantity: { decrement: totalSacadosPedidos } },
          });
        } else if (product.stock) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: totalSacadosPedidos } },
          });
        }
      }

      // Aplica fidelidade (sacos para lojista ou pontos para cliente)
      loyaltyResult = await applyLoyaltyToOrder(order);
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: initialStatus,
      total,
      linkedToAccount: !!userIdFinal,
      isLojista,
      loyaltyApplied: createAndConfirm ? loyaltyResult : null,
    });
  } catch (e: any) {
    console.error("ERRO MANUAL ORDER:", e);
    return NextResponse.json(
      { error: e?.message || "Erro ao criar pedido manual" },
      { status: 500 }
    );
  }
}
