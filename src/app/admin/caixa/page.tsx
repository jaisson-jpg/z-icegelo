import { FinanceManager } from "@/components/admin/FinanceManager";
import { SmartCalculator } from "@/components/admin/SmartCalculator";

export const dynamic = "force-dynamic";

export default function AdminFinancePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[var(--zice-dark)]">Gestão Financeira & Caixa</h1>
        <p className="text-gray-500">Controle de investimentos, vendas e lucro real</p>
      </div>

      <section>
        <FinanceManager />
      </section>

      <section className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-[var(--zice-dark)]">Ferramenta de Precificação</h2>
        </div>
        <SmartCalculator />
      </section>
    </div>
  );
}
