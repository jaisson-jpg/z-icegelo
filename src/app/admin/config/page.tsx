import { prisma } from "@/lib/prisma";
import { ConfigForm } from "@/components/admin/ConfigForm";

export default async function AdminConfigPage() {
  const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-6">Configurações</h1>
      <ConfigForm config={config} />
    </div>
  );
}
