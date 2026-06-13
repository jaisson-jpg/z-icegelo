import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/invoice";
import { applyLoyaltyToOrder } from "@/lib/loyalty";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, applyLoyaltyOnly } = body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: { include: { lojista: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  // Reaplicar fidelidade em pedido já confirmado
  if (applyLoyaltyOnly) {
    if (order.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Confirme o pedido antes de creditar fidelidade" }, { status: 400 });
    }
    const result = await applyLoyaltyToOrder(order);
    return NextResponse.json({ ok: true, ...result });
  }

  if (!["CONFIRMED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  if (status === "CONFIRMED" && order.status !== "CONFIRMED") {
    // Verificar estoque
    for (const item of order.items) {
      const product = item.product;
      const totalSacadosPedidos = item.quantity * product.sacosPerUnit;
      // Se tiver categoria de estoque, verifica a categoria; se não, o estoque individual do produto
      if (product.stockCategoryId) {
        const cat = await prisma.stockCategory.findUnique({ where: { id: product.stockCategoryId } });
        if (cat && cat.quantity < totalSacadosPedidos) {
          return NextResponse.json({
            error: `Estoque insuficiente: ${product.name} (tem ${cat.quantity} em estoque, pedido ${totalSacadosPedidos})`,
          }, { status: 400 });
        }
      } else {
        if (product.stock < totalSacadosPedidos) {
          return NextResponse.json({
            error: `Estoque insuficiente: ${product.name} (tem ${product.stock}, pedido ${totalSacadosPedidos})`,
          }, { status: 400 });
        }
      }
    }

    const invoiceData: Record<string, unknown> = {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    };
    if (order.needsInvoice && !order.invoiceNumber) {
      invoiceData.invoiceNumber = generateInvoiceNumber();
      invoiceData.invoiceIssuedAt = new Date();
    }

    await prisma.order.update({ where: { id }, data: invoiceData });

    for (const item of order.items) {
      const product = item.product;
      const totalSacadosPedidos = item.quantity * product.sacosPerUnit;
      if (product.stockCategoryId) {
        // Decrementa a quantidade da categoria de estoque
        await prisma.stockCategory.update({
          where: { id: product.stockCategoryId },
          data: { quantity: { decrement: totalSacadosPedidos } },
        });
      } else {
        // Decrementa estoque individual do produto
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: totalSacadosPedidos } },
        });
      }
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!updatedOrder) {
      return NextResponse.json({ error: "Erro ao processar pedido" }, { status: 500 });
    }

    const loyalty = await applyLoyaltyToOrder(updatedOrder);
    return NextResponse.json({ ok: true, ...loyalty });
  }

  await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  
  return NextResponse.json({ ok: true });
}
