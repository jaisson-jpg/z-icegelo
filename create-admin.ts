import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const adminEmail = "admin@zicegelo.com.br";
  const adminPassword = "Anapaula01@";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      passwordHash,
      role: "ADMIN" 
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Administrador Z-ice",
      role: "ADMIN",
      phone: "47996471803",
    },
  });

  console.log("Admin criado/atualizado:", admin.email);
  await prisma.$disconnect();
}

createAdmin().catch(console.error);
