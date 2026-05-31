import { PrismaClient } from "@prisma/client";
import { getSacosPerUnit } from "../src/lib/loyalty";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Analisando ${products.length} produtos...`);

  for (const p of products) {
    const calculated = getSacosPerUnit(p);
    if (calculated !== p.sacosPerUnit) {
      console.log(`Corrigindo [${p.name}]: ${p.sacosPerUnit} -> ${calculated}`);
      await prisma.product.update({
        where: { id: p.id },
        data: { sacosPerUnit: calculated },
      });
    }
  }

  console.log("Correção de produtos concluída.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
