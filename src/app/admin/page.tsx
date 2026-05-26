import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { LojistaProgressCard } from "@/components/admin/LojistaProgressCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  noStore();

  const [pendingOrders, totalLojistas, totalCustomers, recentOrders, lojistas] =
    await Promise.all([
      prisma.order.count({
        where: { status: { in: ["PENDING_PIX", "AWAITING_CONFIRMATION"] } },
      }),
      prisma.lojista.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      prisma.lojista.findMany({
        where: { active: true },
        include: { user: true, freezers: { where: { active: true } } },
        orderBy: { sacosComprados: "desc" },
      }),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {[
          { label: "Pedidos pendentes", value: pendingOrders, icon: "🛍️", href: "/admin/pedidos" },
          { label: "Lojistas ativos", value: totalLojistas, icon: "🏪", href: "/admin/lojistas" },
          { label: "Clientes", value: totalCustomers, icon: "👥", href: "/admin/lojistas" },
          {
            label: "Freezers",
            value: lojistas.reduce((s, l) => s + l.freezers.length, 0),
            icon: "❄️",
            href: "/admin/lojistas",
          },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="ice-card rounded-xl p-4 sm:p-6 hover:shadow-lg transition">
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--zice-dark)]">{card.value}</p>
            <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
          </Link>
        ))}
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-[var(--zice-dark)]">
            Lojistas — progresso fidelidade (sacos)
          </h2>
          <Link href="/admin/lojistas" className="text-sm text-[var(--zice-medium)] hover:underline">
            Ver todos →
          </Link>
        </div>
        {lojistas.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum lojista cadastrado.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {lojistas.map((l) => (
              <LojistaProgressCard
                key={l.id}
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
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-bold text-lg mb-4">Últimos pedidos</h2>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-lg p-4 border flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{o.customerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[var(--zice-medium)]">{formatCurrency(o.total)}</p>
                  <p className="text-xs">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/pedidos" className="text-sm text-[var(--zice-medium)] mt-2 inline-block hover:underline">
            Ver todos →
          </Link>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-4">Relatórios</h2>
          <p className="text-sm text-gray-600 mb-4">Gráficos de vendas semanal, mensal e anual.</p>
          <Link href="/admin/relatorios" className="btn-primary inline-flex items-center gap-2">
            📊 Abrir relatórios
          </Link>
        </section>
      </div>
    </div>
  );
}
