import { getSalesStats } from "@/lib/stats";
import { SalesCharts } from "@/components/admin/SalesCharts";
import { formatCurrency } from "@/lib/utils";

export default async function RelatoriosPage() {
  const stats = await getSalesStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-2">Relatórios</h1>
      <p className="text-sm text-gray-600 mb-6">
        Vendas confirmadas — semanal, mensal e anual (dados salvos permanentemente)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="ice-card rounded-xl p-6">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-2xl font-bold text-[var(--zice-dark)]">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-sm text-gray-600">Receita total confirmada</p>
        </div>
        <div className="ice-card rounded-xl p-6">
          <div className="text-2xl mb-2">🛍️</div>
          <p className="text-2xl font-bold text-[var(--zice-dark)]">{stats.totalOrders}</p>
          <p className="text-sm text-gray-600">Pedidos confirmados</p>
        </div>
      </div>

      <SalesCharts weekly={stats.weekly} monthly={stats.monthly} yearly={stats.yearly} />
    </div>
  );
}
