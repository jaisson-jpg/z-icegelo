import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates: Array<{ name: string; sacosPerUnit: number }> = [
    { name: "Gelo em Cubo 2kg", sacosPerUnit: 1 },
    { name: "Gelo em Cubo 5kg", sacosPerUnit: 1 },
    { name: "Gelo em Cubo 10kg", sacosPerUnit: 1 },
    { name: "Gelo Atacado — Pacote 20 sacos", sacosPerUnit: 20 },
    { name: "Gelo Atacado — Pacote 50 sacos", sacosPerUnit: 50 },
    { name: "Gelo Atacado — Pacote 100 sacos", sacosPerUnit: 100 },
  ];

  for (const u of updates) {
    const p = await prisma.product.findFirst({ where: { name: u.name } });
    if (p) {
      await prisma.product.update({ where: { id: p.id }, data: { sacosPerUnit: u.sacosPerUnit } });
      console.log(`Atualizado: ${u.name} = ${u.sacosPerUnit} sacos/un`);
    }
  }
}

main().finally(() => prisma.$disconnect());
