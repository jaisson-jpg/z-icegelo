import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LojistaProgressCard } from "@/components/admin/LojistaProgressCard";

export const dynamic = "force-dynamic";

export default async function AdminLojistasPage() {

  const lojistas = await prisma.lojista.findMany({
    include: {
      user: true,
      freezers: true,
      weeklyPurchases: { orderBy: { weekStart: "desc" }, take: 1 },
    },
    orderBy: { businessName: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)]">Lojistas</h1>
          <p className="text-sm text-gray-600">Progresso de sacos e pontos em tempo real</p>
        </div>
        <Link href="/admin/lojistas/novo" className="btn-primary text-sm">
          ➕ Novo lojista
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {lojistas.map((l) => (
          <div key={l.id} className="space-y-3">
            <LojistaProgressCard
              lojista={{
                id: l.id,
                businessName: l.businessName,
                sacosComprados: l.sacosComprados,
                sacosGratisMeta: l.sacosGratisMeta,
                sacosGratis: l.sacosGratis,
                totalSacosHistorico: l.totalSacosHistorico,
                user: {
                  name: l.user.name,
                  points: l.user.points,
                  phone: l.user.phone,
                },
              }}
            />
            {l.weeklyPurchases[0] && (
              <p className="text-xs text-gray-500 px-1">
                Semana atual: <strong>{l.weeklyPurchases[0].sacosCount}</strong> sacos
              </p>
            )}
            {l.freezers.length > 0 && (
              <p className="text-xs text-gray-500 px-1">
                🧊 {l.freezers.length} freezer(s) alocado(s)
              </p>
            )}
          </div>
        ))}
      </div>

      {lojistas.length === 0 && (
        <p className="text-gray-500">Nenhum lojista cadastrado.</p>
      )}
    </div>
  );
}
