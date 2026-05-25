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
        targetType: "POINTS",
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="ice-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[var(--zice-medium)]">{user?.points ?? 0}</p>
          <p className="text-xs text-gray-600">Pontos</p>
        </div>
        <div className="ice-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[var(--zice-dark)]">{atual}</p>
          <p className="text-xs text-gray-600">Sacos no ciclo</p>
        </div>
        <div className="ice-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[var(--zice-dark)]">{lojista.totalSacosHistorico}</p>
          <p className="text-xs text-gray-600">Total comprado</p>
        </div>
        <div className="ice-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{lojista.sacosGratis}</p>
          <p className="text-xs text-gray-600">Sacos grátis</p>
        </div>
      </div>

      <div className="ice-card rounded-2xl p-6 sm:p-8 mb-8 border-2 border-[var(--zice-light)]">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="text-[var(--zice-medium)]" size={32} />
          <h2 className="text-xl font-bold text-[var(--zice-dark)]">Progresso — Sacos Grátis</h2>
        </div>
        <p className="text-gray-600 mb-6 text-sm">
          Compre <strong>{meta} sacos</strong> e ganhe <strong>{reward} sacos grátis</strong>!
        </p>
        <ProgressBar
          value={atual}
          max={meta}
          size="lg"
          label={`${atual} de ${meta} sacos neste ciclo`}
          sublabel={faltam > 0 ? `Faltam ${faltam} sacos para o prêmio` : "🎉 Meta atingida!"}
        />
        {lojista.sacosGratis > 0 && (
          <p className="mt-5 p-4 bg-green-50 text-green-800 rounded-xl font-semibold text-center">
            🎉 Você tem <strong>{lojista.sacosGratis} sacos grátis</strong> para resgatar!
          </p>
        )}
        {semanaAtual > 0 && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            Esta semana você já comprou <strong>{semanaAtual} sacos</strong>
          </p>
        )}
      </div>

      <Link href="/loja" className="btn-primary w-full justify-center mb-8 text-lg">
        <ShoppingBag size={20} /> Fazer novo pedido
      </Link>

      {rewards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[var(--zice-dark)] mb-4">Prêmios disponíveis</h2>
          <LoyaltyRewardsList rewards={rewards} currentValue={user?.points || 0} type="POINTS" />
        </section>
      )}

      {lojista.freezers.length > 0 && (
        <div className="ice-card rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-[var(--zice-dark)] mb-4 flex items-center gap-2">
            <Snowflake size={22} /> Freezer Z-ice
          </h2>
          {lojista.freezers.map((f) => (
            <div key={f.id} className="p-4 bg-[var(--zice-ice)] rounded-lg mb-2">
              <p className="font-semibold">Código: {f.code}</p>
              <p className="text-sm text-gray-600">Local: {f.location}</p>
            </div>
          ))}
        </div>
      )}

      <div className="ice-card rounded-2xl p-6">
        <h2 className="font-bold text-[var(--zice-dark)] mb-4 flex items-center gap-2">
          <TrendingUp size={22} /> Histórico semanal
        </h2>
        {lojista.weeklyPurchases.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum registro ainda. Após confirmar pedidos, aparece aqui.</p>
        ) : (
          <div className="space-y-2">
            {lojista.weeklyPurchases.map((w) => (
              <div key={w.id} className="flex justify-between text-sm py-2 border-b">
                <span>Semana de {new Date(w.weekStart).toLocaleDateString("pt-BR")}</span>
                <strong className="text-[var(--zice-medium)]">{w.sacosCount} sacos</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
