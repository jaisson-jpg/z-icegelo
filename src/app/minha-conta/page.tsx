import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { LoyaltyRewardsList } from "@/components/LoyaltyRewardsList";
import { Award, Package } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";

export default async function MinhaContaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/admin");
  if (session.role === "LOJISTA") redirect("/lojista");

  const [user, rewards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: {
        orders: { orderBy: { createdAt: "desc" }, take: 10 },
        pointHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
    prisma.loyaltyReward.findMany({
      where: {
        active: true,
        targetType: "POINTS",
        audience: { in: ["VAREJO", "TODOS"] },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!user) redirect("/login");

  const nextReward = rewards.find((r) => user.points < r.targetValue) || rewards[rewards.length - 1];

  const statusLabels: Record<string, string> = {
    PENDING_PIX: "Aguardando PIX",
    AWAITING_CONFIRMATION: "Aguardando confirmação",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--zice-dark)]">Olá, {user.name}!</h1>
          <p className="text-gray-600 text-sm sm:text-base">Sua área Z-ice Fidelidade</p>
        </div>
        <LogoutButton />
      </div>

      {/* Card removido por estar duplicado com a lista de prêmios abaixo */}

      {rewards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[var(--zice-dark)] mb-4">Suas metas e prêmios</h2>
          <LoyaltyRewardsList rewards={rewards} currentValue={user.points} type="POINTS" />
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-bold text-[var(--zice-dark)] mb-4 flex items-center gap-2">
          <Package size={22} /> Meus pedidos
        </h2>
        {user.orders.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido ainda.</p>
        ) : (
          <div className="space-y-3">
            {user.orders.map((o) => (
              <div key={o.id} className="ice-card rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {statusLabels[o.status]} — {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-bold text-[var(--zice-medium)]">{formatCurrency(o.total)}</p>
                  {o.pointsAwarded > 0 && o.status === "CONFIRMED" && (
                    <p className="text-xs text-green-600">+{o.pointsAwarded} pts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/loja" className="btn-primary mt-4 inline-block">Fazer novo pedido</Link>
      </section>

      {user.pointHistory.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[var(--zice-dark)] mb-4">Histórico de pontos</h2>
          <div className="space-y-2">
            {user.pointHistory.map((t) => (
              <div key={t.id} className="flex justify-between text-sm py-2 border-b gap-2">
                <span className="truncate">{t.description}</span>
                <span className={t.amount > 0 ? "text-green-600 font-bold shrink-0" : "text-red-600 shrink-0"}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
