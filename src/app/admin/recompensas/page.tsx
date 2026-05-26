import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RecompensasPage() {
  const rewards = await prisma.loyaltyReward.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)]">Recompensas Fidelidade</h1>
          <p className="text-sm text-gray-600">Configure prêmios com imagem e descrição para clientes e lojistas</p>
        </div>
        <Link href="/admin/recompensas/novo" className="btn-primary text-sm">
          ➕ Nova recompensa
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {rewards.map((r) => (
          <div key={r.id} className={`bg-white rounded-xl border p-4 flex gap-4 ${!r.active ? "opacity-60" : ""}`}>
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.name} className="w-[72px] h-[72px] rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-[72px] h-[72px] ice-gradient rounded-lg flex items-center justify-center text-2xl shrink-0">🎁</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[var(--zice-dark)]">{r.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>
              <p className="text-xs text-[var(--zice-medium)] font-semibold mt-2">
                Meta: {r.targetValue} {r.targetType === "POINTS" ? "pontos" : "sacos"} → {r.rewardLabel}
              </p>
              <p className="text-xs text-gray-400">{r.audience} {r.active ? "" : "(inativo)"}</p>
              <Link href={`/admin/recompensas/${r.id}`} className="inline-flex items-center gap-1 text-sm text-[var(--zice-medium)] mt-2 font-semibold hover:underline">
                ✏️ Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
      {rewards.length === 0 && (
        <p className="text-gray-500">Nenhuma recompensa. Cadastre a primeira!</p>
      )}
    </div>
  );
}
