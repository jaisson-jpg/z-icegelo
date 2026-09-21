import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Tenta detectar quantos SACOS UNITÁRIOS tem dentro de um produto (pacote atacado).
 * Ordem de prioridade:
 *   1) campo sacosPerUnit (se > 1)
 *   2) regex no nome do produto: "20 pacotes 3kg", "15 sacos 5kg", "Kit c/ 10x3kg", etc
 *   3) fallback: 1 unidade (preço unitário = preço do produto)
 */
function extractSacosPerUnit(product: { name: string; sacosPerUnit?: number | null }): number {
  if (product.sacosPerUnit && Number(product.sacosPerUnit) > 0) {
    return Number(product.sacosPerUnit);
  }

  const name = (product.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // padrões: "20 pacotes", "15 sacos", "kit c/ 10x", "12 un", "5 unid", "6 x"
  const patterns = [
    /(\d+)\s*(?:pacotes|pacote|pcs|pc|unidades|unidade|unid|uni|un|sacos|saco)/,
    /kit\s*c[\/]\s*(\d+)/i,
    /(\d+)\s*x\s*\d+\s*(?:kg|k)/, // "10x3kg"
    /(\d+)\s*un/i,
  ];

  for (const regex of patterns) {
    const m = name.match(regex);
    if (m && m[1]) {
      const q = parseInt(m[1], 10);
      if (q >= 1) return q;
    }
  }

  return 1;
}

export async function GET(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  try {
    const [sales, investments, categories, pendingCount] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: "CONFIRMED",
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
        _sum: { total: true },
      }),
      prisma.investment.aggregate({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
        _sum: { amount: true },
      }),
      prisma.stockCategory.findMany({
        orderBy: { name: "asc" },
        include: {
          products: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              price: true,
              lojaPrice: true,
              category: true,
              active: true,
              sacosPerUnit: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: { status: { in: ["PENDING_PIX", "AWAITING_CONFIRMATION"] } },
      }),
    ]);

    const totalSales = sales._sum.total || 0;
    const totalInvestments = investments._sum.amount || 0;

    type StockBreakdown = {
      categoryId: string;
      categoryName: string;
      quantity: number;
      unitPrice: number;              // preço de 1 SACO UNITÁRIO
      totalValue: number;             // quantity × unitPrice
      productName: string;            // produto escolhido
      pricingSource: "LOJA_PRICE_ATACADO" | "PRICE_ATACADO" | "LOJA_PRICE" | "PRICE" | "NENHUM";
      productPackPrice: number;       // preço do pacote (lojaPrice do produto)
      productSacosPerUnit: number;    // quantos sacos vem no produto (20, 15...)
      conversionFormula: string;      // "R$ 70,00 ÷ 20 = R$ 3,50"
    };

    const breakdown: StockBreakdown[] = [];
    let stockValue = 0;

    for (const cat of categories) {
      if (cat.quantity <= 0) continue;

      // ==== 1) PRIORIDADE MÁXIMA: produtos ATACADO ativos COM lojaPrice > 0
      // (escolhe o MENOR preço POR SACO UNITÁRIO depois de dividir por sacosPerUnit)
      type Candidate = {
        product: any;
        packPrice: number;
        sacosPerUnit: number;
        unitPrice: number;
        source: StockBreakdown["pricingSource"];
      };

      const candidates: Candidate[] = [];

      const atacadoComLojaPrice = cat.products.filter(
        (p) => p.category === "ATACADO" && p.lojaPrice !== null && p.lojaPrice !== undefined && Number(p.lojaPrice) > 0
      );
      for (const p of atacadoComLojaPrice) {
        const spu = extractSacosPerUnit({ name: p.name, sacosPerUnit: p.sacosPerUnit });
        const packPrice = Number(p.lojaPrice);
        candidates.push({
          product: p,
          packPrice,
          sacosPerUnit: spu,
          unitPrice: packPrice / spu,
          source: "LOJA_PRICE_ATACADO",
        });
      }

      // ==== 2) ATACADO usando price (fallback se lojaPrice não definido)
      const atacadoAtivos = cat.products.filter(
        (p) => p.category === "ATACADO" && Number(p.price) > 0 && !candidates.find((c) => c.product.id === p.id)
      );
      for (const p of atacadoAtivos) {
        const spu = extractSacosPerUnit({ name: p.name, sacosPerUnit: p.sacosPerUnit });
        const packPrice = Number(p.price);
        candidates.push({
          product: p,
          packPrice,
          sacosPerUnit: spu,
          unitPrice: packPrice / spu,
          source: "PRICE_ATACADO",
        });
      }

      // ==== 3) Qualquer produto com lojaPrice
      const comLojaPrice = cat.products.filter(
        (p) => p.lojaPrice !== null && p.lojaPrice !== undefined && Number(p.lojaPrice) > 0 && !candidates.find((c) => c.product.id === p.id)
      );
      for (const p of comLojaPrice) {
        const spu = extractSacosPerUnit({ name: p.name, sacosPerUnit: p.sacosPerUnit });
        const packPrice = Number(p.lojaPrice);
        candidates.push({
          product: p,
          packPrice,
          sacosPerUnit: spu,
          unitPrice: packPrice / spu,
          source: "LOJA_PRICE",
        });
      }

      // ==== 4) Qualquer produto com price
      const ativos = cat.products.filter(
        (p) => Number(p.price) > 0 && !candidates.find((c) => c.product.id === p.id)
      );
      for (const p of ativos) {
        const spu = extractSacosPerUnit({ name: p.name, sacosPerUnit: p.sacosPerUnit });
        const packPrice = Number(p.price);
        candidates.push({
          product: p,
          packPrice,
          sacosPerUnit: spu,
          unitPrice: packPrice / spu,
          source: "PRICE",
        });
      }

      if (candidates.length === 0) {
        breakdown.push({
          categoryId: cat.id,
          categoryName: cat.name,
          quantity: cat.quantity,
          unitPrice: 0,
          totalValue: 0,
          productName: "(sem produto ativo — associe um produto ATACADO com lojaPrice!)",
          pricingSource: "NENHUM",
          productPackPrice: 0,
          productSacosPerUnit: 1,
          conversionFormula: "—",
        });
        continue;
      }

      // ==== ESCOLHE O CANDIDATO COM MENOR PREÇO UNITÁRIO
      const best = candidates.reduce((a, b) => (a.unitPrice < b.unitPrice ? a : b));
      const total = cat.quantity * best.unitPrice;

      let formula = "";
      if (best.sacosPerUnit === 1) {
        formula = `1 uni = R$ ${best.packPrice.toFixed(2)}`;
      } else {
        formula = `R$ ${best.packPrice.toFixed(2)} ÷ ${best.sacosPerUnit} = R$ ${best.unitPrice.toFixed(2)}`;
      }

      breakdown.push({
        categoryId: cat.id,
        categoryName: cat.name,
        quantity: cat.quantity,
        unitPrice: best.unitPrice,
        totalValue: total,
        productName: best.product.name,
        pricingSource: best.source,
        productPackPrice: best.packPrice,
        productSacosPerUnit: best.sacosPerUnit,
        conversionFormula: formula,
      });

      stockValue += total;
    }

    const response = NextResponse.json({
      totalSales,
      totalInvestments,
      stockValue,
      stockBreakdown: breakdown,
      pendingOrders: pendingCount,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    return response;
  } catch (e) {
    console.error(e);
    const err = NextResponse.json({ error: "Erro ao buscar resumo financeiro" }, { status: 500 });
    err.headers.set("Cache-Control", "no-store");
    return err;
  }
}
