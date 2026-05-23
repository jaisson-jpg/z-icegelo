"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X, Gift } from "lucide-react";

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

  const callApi = async (body: Record<string, unknown>) => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Erro ao processar");
      return;
    }

    if (data.pointsCredited || data.sacosCredited) {
      let msg = "Fidelidade creditada!\n";
      if (data.pointsCredited) msg += `+${data.pointsCredited} pontos\n`;
      if (data.sacosCredited) msg += `+${data.sacosCredited} sacos na barra de progresso\n`;
      if (data.sacosGratisEarned) msg += `🎉 ${data.sacosGratisEarned} sacos grátis liberados!`;
      alert(msg);
    } else if (data.alreadyHadSacos) {
      alert("Pontos e sacos deste pedido já foram creditados.");
    } else if (!data.lojistaFound && data.sacosCredited === 0) {
      alert("Pontos OK. Sacos: lojista não vinculado — confira telefone/login ou cadastre em Lojistas.");
    } else if (data.sacosCredited === 0) {
      alert("Nenhum saco contabilizado neste pedido (verifique produtos e sacos por unidade).");
    }

    router.refresh();
    setTimeout(() => window.location.reload(), 300);
  };

  const confirmPix = () => {
    if (!window.confirm("Confirmar pagamento PIX e creditar pontos/sacos?")) return;
    callApi({ status: "CONFIRMED" });
  };

  const reapplyLoyalty = () => {
    if (!window.confirm("Creditar pontos e sacos deste pedido ao lojista/cliente?")) return;
    callApi({ applyLoyaltyOnly: true });
  };

  const cancelOrder = () => {
    if (!window.confirm("Cancelar pedido?")) return;
    callApi({ status: "CANCELLED" });
  };

  if (isConfirmed) {
    return (
      <button
        onClick={reapplyLoyalty}
        disabled={loading}
        className="btn-primary text-sm py-2 bg-amber-600"
      >
        <Gift size={16} />{" "}
        {loyaltyApplied && sacosCredited > 0
          ? "Recreditar sacos"
          : loyaltyApplied
            ? "Atualizar sacos na barra"
            : "Creditar fidelidade"}
      </button>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={confirmPix} disabled={loading} className="btn-primary text-sm py-2">
        <Check size={16} /> Confirmar PIX
      </button>
      <button
        onClick={cancelOrder}
        disabled={loading}
        className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 flex items-center gap-1"
      >
        <X size={16} /> Cancelar
      </button>
    </div>
  );
}
