import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LojistaForm } from "@/components/admin/LojistaForm";
import { FreezerForm } from "@/components/admin/FreezerForm";
import { WeeklyPurchaseForm } from "@/components/admin/WeeklyPurchaseForm";
import { LojistaRewardActions } from "@/components/admin/LojistaRewardActions";
import { ProgressBar } from "@/components/ProgressBar";

export default async function EditarLojistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lojista = await prisma.lojista.findUnique({
    where: { id },
    include: {
      user: true,
      freezers: true,
      weeklyPurchases: { orderBy: { weekStart: "desc" }, take: 8 },
    },
  });

  if (!lojista) notFound();

  const meta = lojista.sacosGratisMeta || 100;
  const atual = lojista.sacosComprados;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--zice-dark)]">{lojista.businessName}</h1>
          <p className="text-gray-500">Gestão de fidelidade e infraestrutura do lojista</p>
        </div>
      </div>

      {/* SEÇÃO DE FIDELIDADE - DESTAQUE */}
      <section className="bg-white rounded-3xl border-2 border-[var(--zice-medium)] p-8 shadow-xl">
        <h2 className="font-black text-xl mb-6 flex items-center gap-2 text-[var(--zice-dark)]">
          🎁 CONTROLE DE PRÊMIOS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase mb-2">Progresso Atual</p>
            <ProgressBar 
              value={atual} 
              max={meta} 
              size="lg" 
              label={`${atual} de ${meta} sacos`}
            />
          </div>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-100 flex flex-col justify-center">
            <p className="text-sm font-bold text-green-600 uppercase mb-1">Prêmios Pendentes</p>
            <p className="text-4xl font-black text-green-700">{lojista.sacosGratis} sacos grátis</p>
          </div>
        </div>

        <LojistaRewardActions lojistaId={lojista.id} sacosGratis={lojista.sacosGratis} />
      </section>

      <section>
        <h2 className="font-bold text-lg mb-4 uppercase tracking-wider text-gray-500">Dados do lojista</h2>
        <LojistaForm lojista={lojista} />
      </section>

      <section className="bg-white rounded-xl border p-6">
        <h2 className="font-bold text-lg mb-4">Registrar compra semanal (sacos)</h2>
        <WeeklyPurchaseForm lojistaId={lojista.id} />
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Histórico semanal</h3>
          <div className="space-y-1">
            {lojista.weeklyPurchases.map((w) => (
              <p key={w.id} className="text-sm text-gray-600">
                {new Date(w.weekStart).toLocaleDateString("pt-BR")}: <strong>{w.sacosCount}</strong> sacos
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border p-6">
        <h2 className="font-bold text-lg mb-4">Freezers alocados</h2>
        <FreezerForm lojistaId={lojista.id} />
        <div className="mt-4 space-y-2">
          {lojista.freezers.map((f) => (
            <div key={f.id} className="flex justify-between items-center p-3 bg-[var(--zice-ice)] rounded-lg text-sm">
              <span>
                <strong>{f.code}</strong> — {f.location}
                {f.brand && ` (${f.brand})`}
              </span>
              <span className={f.active ? "text-green-600" : "text-gray-400"}>
                {f.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
