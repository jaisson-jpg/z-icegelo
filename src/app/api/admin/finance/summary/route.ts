import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function addNoCache(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");
  res.headers.set("X-Accel-Expires", "0");
  res.headers.set("Vary", "*");
  res.headers.set("X-No-Cache", "1");
  return res;
}

function extractSacosPerUnit(product: { name: string; sacosPerUnit?: number | null }): number {
  if (product.sacosPerUnit && Number(product.sacosPerUnit) > 0) {
    return Number(product.sacosPerUnit);
  }

  const name = (product.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const patterns = [
    /(\d+)\s*(?:pacotes|pacote|pcs|pc|unidades|unidade|unid|uni|un|sacos|saco)/,
    /kit\s*c[\/]\s*(\d+)/i,
    /(\d+)\s*x\s*\d+\s*(?:kg|k)/,
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
  if (!session) return addNoCache(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));

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
            orderBy: [
              { updatedAt: "desc" },
              { createdAt: "desc" },
            ],
            select: {
              id: true,
              name: true,
              price: true,
              lojaPrice: true,
              category: true,
              active: true,
              sacosPerUnit: true,
              updatedAt: true,
              createdAt: true,
              sortOrder: true,
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
      unitPrice: number;
      totalValue: number;
      productName: string;
      productId: string | null;
      pricingSource: "LOJA_PRICE_ATACADO" | "PRICE_ATACADO" | "LOJA_PRICE" | "PRICE" | "NENHUM";
      productPackPrice: number;
      productSacosPerUnit: number;
      conversionFormula: string;
      updatedAt: string | null;
      candidateCount: number;
      warningMulti: boolean;
    };

    const breakdown: StockBreakdown[] = [];
    let stockValue = 0;

    for (const cat of categories) {
      if (cat.quantity <= 0) continue;

      type Candidate = {
        product: any;
        packPrice: number;
        sacosPerUnit: number;
        unitPrice: number;
        source: StockBreakdown["pricingSource"];
        updatedAt: Date;
      };
      const candidates: Candidate[] = [];

      // =================================================================
      // 🔝 PRIORIDADE MÁXIMA (1): PREÇO LOJISTA (lojaPrice) — QUALQUER CATEGORIA!
      // (VAREJO ou ATACADO, não importa! Se tem "Preço Lojista Exclusivo" é esse que usa!)
      // =================================================================
      const QUALQUER_comLojaPrice = cat.products.filter(
        (p) => p.lojaPrice !== null && p.lojaPrice !== undefined && Number(p.lojaPrice) > 0
      );
      for (const p of QUALQUER_comLojaPrice) {
        const spu = extractSacosPerUnit({ name: p.name, sacosPerUnit: p.sacosPerUnit });
        const packPrice = Number(p.lojaPrice);
        const ehAtacado = p.category === "ATACADO";
        candidates.push({
          product: p,
          packPrice,
          sacosPerUnit: spu,
          unitPrice: packPrice / spu,
          source: ehAtacado ? "LOJA_PRICE_ATACADO" : "LOJA_PRICE",
          updatedAt: p.updatedAt as Date,
        });
      }

      // =================================================================
      // PRIORIDADE 2: Preço normal (price) de produto ATACADO ativo
      // (sem lojaPrice — fallback antigo, se não tiver nada com lojaPrice)
      // =================================================================
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
          updatedAt: p.updatedAt as Date,
        });
      }

      // =================================================================
      // PRIORIDADE 3: Preço normal (price) de QUALQUER produto ativo (fallback extremo)
      // =================================================================
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
          updatedAt: p.updatedAt as Date,
        });
      }

      if (candidates.length === 0) {
        breakdown.push({
          categoryId: cat.id,
          categoryName: cat.name,
          quantity: cat.quantity,
          unitPrice: 0,
          totalValue: 0,
          productName: "(sem preço — cadastre Preço Lojista Exclusivo no produto!)",
          productId: null,
          pricingSource: "NENHUM",
          productPackPrice: 0,
          productSacosPerUnit: 1,
          conversionFormula: "—",
          updatedAt: null,
          candidateCount: 0,
          warningMulti: false,
        });
        continue;
      }

      candidates.sort((a, b) => {
        // PRIORIDADE 1: SEMPRE vem primeiro quem TEM PREÇO LOJISTA!
        // Ranking: LOJA_PRICE_ATACADO (5) / LOJA_PRICE (4) / PRICE_ATACADO (3) / PRICE (2)
        const rank = (s: string) =>
          s === "LOJA_PRICE_ATACADO" ? 5 :
          s === "LOJA_PRICE" ? 4 :
          s === "PRICE_ATACADO" ? 3 : 2;
        const rankDiff = rank(b.source) - rank(a.source);
        if (rankDiff !== 0) return rankDiff;
        // PRIORIDADE 2: MAIS RECENTEMENTE EDITADO (updatedAt mais recente PRIMEIRO)
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });

      const best = candidates[0];
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
        productId: best.product.id,
        pricingSource: best.source,
        productPackPrice: best.packPrice,
        productSacosPerUnit: best.sacosPerUnit,
        conversionFormula: formula,
        updatedAt: best.updatedAt ? best.updatedAt.toISOString() : null,
        candidateCount: candidates.length,
        warningMulti: candidates.length > 1,
      });

      stockValue += total;
    }

    const response = NextResponse.json({
      totalSales,
      totalInvestments,
      stockValue,
      stockBreakdown: breakdown,
      pendingOrders: pendingCount,
      generatedAt: new Date().toISOString(),
    });
    return addNoCache(response);
  } catch (e) {
    console.error(e);
    const err = NextResponse.json({ error: "Erro ao buscar resumo financeiro" }, { status: 500 });
    return addNoCache(err);
  }
}
