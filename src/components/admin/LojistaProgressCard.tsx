import { ProgressBar } from "@/components/ProgressBar";
import Link from "next/link";

type LojistaData = {
  id: string;
  businessName: string;
  sacosComprados: number;
  sacosGratisMeta: number;
  sacosGratis: number;
  totalSacosHistorico: number;
  user: { name: string; points: number; phone: string | null };
};

export function LojistaProgressCard({ lojista }: { lojista: LojistaData }) {
  const meta = lojista.sacosGratisMeta || 100;
  const atual = lojista.sacosComprados;
  const faltam = Math.max(0, meta - atual);

  return (
    <div className="bg-white rounded-xl border p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-2 mb-3">
        <div>
          <Link
            href={`/admin/lojistas/${lojista.id}`}
            className="font-bold text-[var(--zice-dark)] hover:text-[var(--zice-medium)]"
          >
            {lojista.businessName}
          </Link>
          <p className="text-xs text-gray-500">{lojista.user.name}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-[var(--zice-medium)] font-bold">{lojista.user.points} pts</p>
          {lojista.sacosGratis > 0 && (
            <p className="text-green-600 text-xs font-semibold">🎁 {lojista.sacosGratis} grátis</p>
          )}
        </div>
      </div>

      <ProgressBar
        value={atual}
        max={meta}
        size="md"
        label={`${atual} de ${meta} sacos no ciclo`}
        sublabel={faltam > 0 ? `Faltam ${faltam} sacos` : "Meta atingida!"}
      />

      <p className="text-xs text-gray-500 mt-3">
        Total histórico: <strong>{lojista.totalSacosHistorico}</strong> sacos comprados
      </p>
    </div>
  );
}
