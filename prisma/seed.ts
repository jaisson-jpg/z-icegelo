import { PrismaClient, ProductCategory, RewardTargetType, RewardAudience } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zicegelo.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "Anapaula01@";

  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      pixKey: "47996471803",
      pixHolder: "Z-ice Gelo",
      whatsapp: "5547996471803",
      pointsPerReal: 1,
      sacosGratisMeta: 100,
      sacosGratisReward: 5,
      companyName: "Z-ice Gelo",
      companyAddress: "Guaramirim - Santa Catarina",
      companyPhone: "47996471803",
    },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: process.env.ADMIN_NAME || "Administrador",
      role: "ADMIN",
      phone: "47996471803",
    },
  });

  const rewards = [
    {
      name: "5 Sacos de Gelo Grátis",
      description: "Ganhe 5 sacos de gelo sem pagar ao atingir a meta de compras!",
      targetType: RewardTargetType.SACOS,
      targetValue: 100,
      rewardLabel: "5 sacos grátis",
      audience: RewardAudience.ATACADO,
      sortOrder: 1,
    },
    {
      name: "Desconto Especial",
      description: "Acumule pontos e troque por benefícios exclusivos Z-ice.",
      targetType: RewardTargetType.POINTS,
      targetValue: 500,
      rewardLabel: "Benefício especial",
      audience: RewardAudience.VAREJO,
      sortOrder: 2,
    },
  ];

  for (const r of rewards) {
    const exists = await prisma.loyaltyReward.findFirst({ where: { name: r.name } });
    if (!exists) await prisma.loyaltyReward.create({ data: r });
  }

  const products = [
    {
      name: "Gelo em Cubo 2kg",
      description: "Saco de gelo em cubo 2kg — ideal para uso doméstico e festas.",
      price: 8.0,
      unit: "saco",
      category: ProductCategory.VAREJO,
      pointsEarn: 8,
      stock: 100,
      sortOrder: 1,
    },
    {
      name: "Gelo em Cubo 5kg",
      description: "Saco de gelo em cubo 5kg — perfeito para churrascos e eventos.",
      price: 15.0,
      unit: "saco",
      category: ProductCategory.VAREJO,
      pointsEarn: 15,
      stock: 100,
      sortOrder: 2,
    },
    {
      name: "Gelo em Cubo 10kg",
      description: "Saco de gelo em cubo 10kg — maior volume para o dia a dia.",
      price: 25.0,
      unit: "saco",
      category: ProductCategory.VAREJO,
      pointsEarn: 25,
      stock: 100,
      sortOrder: 3,
    },
    {
      name: "Gelo Atacado — Pacote 20 sacos",
      description: "Pacote promocional para comércios: 20 sacos de gelo 5kg.",
      price: 260.0,
      unit: "pacote",
      category: ProductCategory.ATACADO,
      pointsEarn: 260,
      stock: 50,
      sortOrder: 10,
    },
    {
      name: "Gelo Atacado — Pacote 50 sacos",
      description: "Pacote para mercados e padarias: 50 sacos de gelo 5kg.",
      price: 600.0,
      unit: "pacote",
      category: ProductCategory.ATACADO,
      pointsEarn: 600,
      stock: 30,
      sortOrder: 11,
    },
    {
      name: "Gelo Atacado — Pacote 100 sacos",
      description: "Grande volume semanal para lojistas parceiros Z-ice.",
      price: 1100.0,
      unit: "pacote",
      category: ProductCategory.ATACADO,
      pointsEarn: 1100,
      stock: 20,
      sortOrder: 12,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("Seed concluído!");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
