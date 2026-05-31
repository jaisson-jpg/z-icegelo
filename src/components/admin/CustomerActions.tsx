"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmModal";

export function CustomerActions({ 
  customerId, 
  customerName, 
  currentPoints 
}: { 
  customerId: string; 
  customerName: string;
  currentPoints: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-10 w-full bg-gray-50 rounded-lg animate-pulse" />;

  const handleDelete = async () => {
    const ok = await confirm(
      "Excluir Usuário?",
      `Tem certeza que deseja excluir ${customerName}? Esta ação é permanente e removerá todo o histórico.`,
      "danger"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${customerId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erro ao excluir usuário");
      }
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPoints = async () => {
    const ok = await confirm(
      "Zerar Pontuação?",
      `Deseja zerar os ${currentPoints} pontos de ${customerName}? Esta ação não pode ser desfeita.`,
      "danger"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${customerId}/reset-points`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erro ao zerar pontos");
      }
    } catch (e) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <ConfirmComponent />
      <button
        onClick={handleResetPoints}
        className="flex-1 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded-lg text-xs font-bold transition-colors"
        disabled={loading}
        title="Zerar pontuação"
      >
        🔄 ZERAR PONTOS
      </button>
      <button
        onClick={handleDelete}
        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
        disabled={loading}
        title="Excluir usuário"
      >
        🗑️
      </button>
    </div>
  );
}
