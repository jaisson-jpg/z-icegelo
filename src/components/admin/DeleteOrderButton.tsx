"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const handleDelete = async () => {
    if (!confirm("Excluir este pedido permanentemente?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      router.refresh();
    } catch (e) {
      alert("Erro ao excluir pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir pedido"
    >
      🗑️
    </button>
  );
}
