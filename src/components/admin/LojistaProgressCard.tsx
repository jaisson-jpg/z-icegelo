"use client";

import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-32 bg-gray-50 animate-pulse rounded-2xl" />;

  const meta = lojista.sacosGratisMeta || 100;
  const atual = lojista.sacosComprados || 0;
  const porcentagem = Math.min(100, Math.floor((atual / meta) * 100));

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-[var(--zice-dark)] truncate">{lojista.businessName}</h3>
          <p className="text-xs text-gray-500">{lojista.user?.name || "Lojista"}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-[var(--zice-medium)]">{atual}/{meta}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Sacos</p>
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4 border border-gray-50">
        <div 
          className="h-full ice-gradient transition-all duration-1000" 
          style={{ width: `${porcentagem}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase">{porcentagem}% Concluído</span>
        <Link 
          href={`/admin/lojistas/${lojista.id}`}
          className="text-xs font-bold text-[var(--zice-medium)] hover:underline"
        >
          Ver Detalhes →
        </Link>
      </div>
    </div>
  );
}
