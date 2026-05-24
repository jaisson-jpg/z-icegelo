import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { findLojistaForOrder, normalizePhone } from "@/lib/loyalty";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerEmail = (formData.get("customerEmail") as string) || null;
    const customerCpfCnpj = (formData.get("customerCpfCnpj") as string) || null;
    const address = (formData.get("address") as string) || null;
    const needsInvoice = formData.get("needsInvoice") === "true";
    const itemsJson = formData.get("items") as string;
    const total = parseFloat(formData.get("total") as string);
    const deliveryFee = parseFloat(formData.get("deliveryFee") as string) || 0;
    const receipt = formData.get("receipt") as File | null;

    if (!customerName || !customerPhone || !itemsJson || isNaN(total)) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (needsInvoice && !customerCpfCnpj) {
      return NextResponse.json({ error: "CPF/CNPJ obrigatório para nota fiscal" }, { status: 400 });
    }

    const items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      category: "VAREJO" | "ATACADO";
    }> = JSON.parse(itemsJson);

    if (items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Produto não encontrado: ${item.name}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({
          error: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}`,
        }, { status: 400 });
      }
    }

    let pixReceiptUrl: string | null = null;
    if (receipt && receipt.size > 0) {
      pixReceiptUrl = await saveUpload(receipt);
    }

    const session = await getSession();
    const userId = session?.id ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Você precisa estar logado para fazer um pedido" }, { status: 401 });
    }

    const category = items.some((i) => i.category === "ATACADO") ? "ATACADO" : "VAREJO";
    const orderNumber = generateOrderNumber();

    const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
    const pointsPerReal = config?.pointsPerReal ?? 1;
    const pointsAwarded = Math.floor(total * pointsPerReal);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerPhone: normalizePhone(customerPhone) || customerPhone,
        customerEmail,
        customerCpfCnpj: customerCpfCnpj?.replace(/\D/g, "") || null,
        address,
        category,
        total,
        deliveryFee,
        needsInvoice,
        status: pixReceiptUrl ? "AWAITING_CONFIRMATION" : "PENDING_PIX",
        pixReceiptUrl,
        pointsAwarded,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.price,
            subtotal: i.price * i.quantity,
          })),
        },
      },
    });

    return NextResponse.json({
      orderId: order.orderNumber,
      id: order.id,
      linkedToAccount: !!userId,
    });
  } catch (e: unknown) {
    console.error("ERRO NO POST /api/orders:", e);
    // Retorna mensagem mais específica se for erro do Prisma
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ 
      error: "Erro ao criar pedido no banco de dados", 
      details: process.env.NODE_ENV === "development" ? message : undefined 
    }, { status: 500 });
  }
}
