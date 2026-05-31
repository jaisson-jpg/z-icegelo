"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmModal";


export function ConfirmOrderButton({
  orderId,
  isConfirmed,
  loyaltyApplied,
  sacosCredited = 0,
}: {
  orderId: string;
  isConfirmed?: boolean;
  loyaltyApplied?: boolean;
  sacosCredited?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-10 w-full bg-gray-100 rounded-lg" />;

  const handleConfirm = async () => {
    const ok = await confirm(
      "Confirmar Pedido?",
      "Deseja confirmar este pedido e creditar a fidelidade para o cliente?",
      "success"
    );
    if (!ok) return;

    setLoading(true);
    
    // Feedback otimista: se for uma confirmação simples, podemos atualizar o router rapidamente
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao confirmar");
      }
      
      // Refresh imediato
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Erro ao confirmar pedido");
      setLoading(false);
    }
  };

  const handleReapplyLoyalty = async () => {
    const ok = await confirm(
      "Recalcular Fidelidade?",
      "Deseja recalcular e reaplicar os pontos/sacos para este pedido?",
      "info"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyLoyaltyOnly: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao aplicar");
      }
      
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Erro ao aplicar fidelidade");
    } finally {
      setLoading(false);
    }
  };



  if (isConfirmed) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <ConfirmComponent />
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-200">
          <span>✅ PEDIDO CONFIRMADO</span>
        </div>
        <button
          onClick={handleReapplyLoyalty}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-[10px] font-bold transition-colors border border-orange-200 disabled:opacity-50"
        >
          <span>🎁 RECREDITAR SACOS/PONTOS</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <ConfirmComponent />
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
      >
        {loading ? "Processando..." : "✅ CONFIRMAR PEDIDO"}
      </button>
    </>
  );
}
