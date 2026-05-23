"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

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
      <Trash2 size={16} />
    </button>
  );
}
