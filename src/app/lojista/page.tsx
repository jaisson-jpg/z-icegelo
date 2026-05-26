import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { LoyaltyRewardsList } from "@/components/LoyaltyRewardsList";
import { ProgressBar } from "@/components/ProgressBar";
import { Gift, Snowflake, TrendingUp, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LojistaPage() {
  noStore();

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/admin");
  if (session.role !== "LOJISTA") redirect("/minha-conta");

  const [lojista, user, rewards, config] = await Promise.all([
    prisma.lojista.findFirst({
      where: { userId: session.id },
      include: {
        freezers: { where: { active: true } },
        weeklyPurchases: { orderBy: { weekStart: "desc" }, take: 4 },
      },
    }),
    prisma.user.findUnique({ where: { id: session.id } }),
    prisma.loyaltyReward.findMany({
      where: {
        active: true,
        audience: { in: ["ATACADO", "TODOS"] },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteConfig.findUnique({ where: { id: "main" } }),
  ]);

  if (!lojista) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p>Perfil de lojista não encontrado. Entre em contato com a Z-ice.</p>
      </div>
    );
  }

  const meta = lojista.sacosGratisMeta || 100;
  const atual = lojista.sacosComprados;
  const faltam = Math.max(0, meta - atual);
  const reward = config?.sacosGratisReward ?? 5;
  const semanaAtual = lojista.weeklyPurchases[0]?.sacosCount ?? 0;

  const pointRewards = rewards.filter(r => r.targetType === "POINTS");
  const sacosRewards = rewards.filter(r => r.targetType === "SACOS");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--zice-dark)]">
            {lojista.businessName}
          </h1>
          <p className="text-gray-600 text-sm">Área do lojista parceiro Z-ice</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="ice-card rounded-2xl p-6 text-center border-2 border-[var(--zice-light)]">
          <p className="text-4xl font-black text-[var(--zice-medium)]">{atual}</p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sacos Comprados</p>
          <p className="text-xs text-gray-400 mt-1">Neste ciclo de prêmios</p>
        </div>
        <div className="ice-card rounded-2xl p-6 text-center border-2 border-[var(--zice-light)]">
          <p className="text-4xl font-black text-green-600">{lojista.sacosGratis}</p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prêmios a Receber</p>
          <p className="text-xs text-gray-400 mt-1">Aguardando entrega do Admin</p>
        </div>
      </div>

      <div className="ice-card rounded-3xl p-8 mb-8 border-2 border-[var(--zice-medium)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gift size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[var(--zice-medium)] text-white p-2 rounded-xl">
              <Gift size={24} />
            </div>
            <h2 className="text-2xl font-black text-[var(--zice-dark)]">Seu Progresso</h2>
          </div>
          
          <p className="text-gray-600 mb-8 text-lg">
            Complete <strong>{meta} sacos</strong> para ganhar seu benefício!
          </p>
          
          <ProgressBar
            value={atual}
            max={meta}
            size="lg"
            label={`${atual} de ${meta} sacos`}
            sublabel={faltam > 0 ? `Faltam apenas ${faltam} sacos!` : "🎉 PARABÉNS! Meta atingida!"}
          />

          {lojista.sacosGratis > 0 && (
            <div className="mt-8 p-6 bg-green-600 text-white rounded-2xl shadow-lg animate-bounce text-center">
              <p className="text-xl font-black">🎁 VOCÊ TEM {lojista.sacosGratis} PRÊMIO(S)!</p>
              <p className="text-sm opacity-90 font-medium mt-1">O administrador irá entregar seu prêmio em breve.</p>
            </div>
          )}
        </div>
      </div>

      <Link href="/loja" className="btn-primary w-full justify-center mb-10 py-5 text-xl shadow-2xl hover:scale-[1.02] transition-transform">
        <ShoppingBag size={24} /> FAZER NOVO PEDIDO
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lojista.freezers.length > 0 && (
          <div className="ice-card rounded-2xl p-6">
            <h2 className="font-bold text-[var(--zice-dark)] mb-4 flex items-center gap-2">
              <Snowflake size={22} className="text-blue-400" /> Freezer Z-ice
            </h2>
            {lojista.freezers.map((f) => (
              <div key={f.id} className="p-4 bg-[var(--zice-ice)] rounded-xl mb-2 border border-blue-100">
                <p className="font-bold text-[var(--zice-dark)]">CÓDIGO: {f.code}</p>
                <p className="text-xs text-gray-500 uppercase font-bold">{f.location}</p>
              </div>
            ))}
          </div>
        )}

        <div className="ice-card rounded-2xl p-6">
          <h2 className="font-bold text-[var(--zice-dark)] mb-4 flex items-center gap-2">
            <TrendingUp size={22} className="text-green-500" /> Histórico Recente
          </h2>
          {lojista.weeklyPurchases.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Nenhum registro ainda.</p>
          ) : (
            <div className="space-y-3">
              {lojista.weeklyPurchases.map((w) => (
                <div key={w.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 font-medium">Semana {new Date(w.weekStart).toLocaleDateString("pt-BR")}</span>
                  <span className="bg-[var(--zice-ice)] text-[var(--zice-medium)] px-3 py-1 rounded-full text-xs font-bold">
                    {w.sacosCount} sacos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
