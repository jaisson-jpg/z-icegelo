import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LojistaForm } from "@/components/admin/LojistaForm";
import { FreezerForm } from "@/components/admin/FreezerForm";
import { WeeklyPurchaseForm } from "@/components/admin/WeeklyPurchaseForm";

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

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-[var(--zice-dark)]">{lojista.businessName}</h1>

      <section>
        <h2 className="font-bold text-lg mb-4">Dados do lojista</h2>
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
