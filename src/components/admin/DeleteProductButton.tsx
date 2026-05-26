"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function DeleteProductButton({
  id,
  name,
  hasOrders,
}: {
  id: string;
  name: string;
  hasOrders: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-2 w-8 h-8" />;

  const handleDelete = async () => {
    const msg = hasOrders
      ? `"${name}" já foi usado em pedidos. Deseja desativar em vez de excluir?`
      : `Excluir o produto "${name}"? Esta ação não pode ser desfeita.`;

    if (!confirm(msg)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao excluir");
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={hasOrders ? "Desativar produto" : "Excluir produto"}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
    >
      🗑️
    </button>
  );
}
