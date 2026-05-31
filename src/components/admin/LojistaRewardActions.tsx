"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmModal";

export function LojistaRewardActions({ 
  lojistaId, 
  sacosGratis 
}: { 
  lojistaId: string; 
  sacosGratis: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { confirm, ConfirmComponent } = useConfirm();

  const handlePayReward = async () => {
    if (sacosGratis <= 0) return;
    const ok = await confirm(
      "Entregar Prêmio?",
      "Confirmar entrega de prêmio para este lojista? Isso irá descontar 1 prêmio do saldo dele.",
      "success"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lojistas/${lojistaId}/pay-reward`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erro ao processar");
      
      router.refresh();
    } catch (e) {
      alert("Erro ao registrar pagamento do prêmio");
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async () => {
    const ok = await confirm(
      "Zerar Progresso?",
      "Deseja zerar o progresso de sacos comprados deste lojista? Esta ação não pode ser desfeita.",
      "danger"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lojistas/${lojistaId}/reset-progress`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Erro ao resetar");
      
      router.refresh();
    } catch (e) {
      alert("Erro ao resetar progresso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <ConfirmComponent />
      <button
        onClick={handlePayReward}
        disabled={loading || sacosGratis <= 0}
        className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
          sacosGratis > 0 
            ? "bg-green-600 hover:bg-green-700 hover:scale-[1.02]" 
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {loading ? "PROCESSANDO..." : "🎁 MARCAR PRÊMIO COMO PAGO"}
      </button>

      <button
        onClick={handleResetProgress}
        disabled={loading}
        className="flex-1 py-4 rounded-2xl font-bold text-orange-600 bg-orange-50 border-2 border-orange-100 hover:bg-orange-100 transition-all"
      >
        🔄 ZERAR PROGRESSO ATUAL
      </button>
    </div>
  );
}
