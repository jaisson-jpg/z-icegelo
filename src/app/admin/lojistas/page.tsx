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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lojistas.map((l) => (
          <div key={l.id} className="relative group">
            {l.sacosGratis > 0 && (
              <div className="absolute -top-3 -right-3 z-10 bg-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg animate-bounce border-2 border-white">
                🎁 PRÊMIO PENDENTE
              </div>
            )}
            <div className="space-y-3">
              <LojistaProgressCard 
                id={l.id}
                businessName={l.businessName}
                userName={l.user?.name || "Lojista"}
                sacosComprados={l.sacosComprados || 0}
                meta={l.sacosGratisMeta || 100} 
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
