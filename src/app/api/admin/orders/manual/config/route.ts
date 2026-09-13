import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  try {
    // 1) Usuários (lojistas + clientes) para busca
    let usersQuery: any = {
      include: { lojista: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      take: 100,
    };
    if (q) {
      usersQuery.where = {
        OR: [
          { name: { contains: q, mode: "insensitive" as any } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" as any } },
          { lojista: { businessName: { contains: q, mode: "insensitive" as any } } },
          { lojista: { cnpj: { contains: q } } },
        ],
      };
    }
    const users = await prisma.user.findMany(usersQuery as any);

    // 2) Produtos ativos para selecionar no pedido
    let productsQuery: any = {
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: { stockCategory: true },
      take: 300,
    };
    if (q) {
      productsQuery.where = {
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" as any } },
          { category: { contains: q, mode: "insensitive" as any } },
        ],
      };
    }
    const products = await prisma.product.findMany(productsQuery);

    // 3) Config do site (frete padrão, etc)
    const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isLojista: !!u.lojista,
        businessName: u.lojista?.businessName || null,
        cnpj: u.lojista?.cnpj || null,
        address: u.lojista?.address || null,
        city: u.lojista?.city || null,
        state: u.lojista?.state || null,
        weeklyTarget: u.lojista?.weeklyTarget || null,
        sacosComprados: u.lojista?.sacosComprados || 0,
        sacosGratis: u.lojista?.sacosGratis || 0,
      })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        lojaPrice: p.lojaPrice,
        category: p.category,
        active: p.active,
        sacosPerUnit: p.sacosPerUnit || 1,
        stock: p.stockCategory?.quantity ?? p.stock,
        stockCategoryName: p.stockCategory?.name || null,
        stockCategoryId: p.stockCategoryId || null,
        pointsEarn: p.pointsEarn || 0,
      })),
      siteConfig: config
        ? {
            pixKey: config.pixKey,
            whatsapp: config.whatsapp,
            pointsPerReal: config.pointsPerReal,
            companyName: config.companyName,
            companyCNPJ: config.companyCNPJ,
            deliveryZip: config.deliveryZip || null,
            deliveryMinValue: config.deliveryMinValue || 0,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao carregar configurações" }, { status: 500 });
  }
}
