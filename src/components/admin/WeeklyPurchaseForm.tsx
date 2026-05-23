"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WeeklyPurchaseForm({ lojistaId }: { lojistaId: string }) {
  const router = useRouter();
  const [sacosCount, setSacosCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/lojistas/${lojistaId}/weekly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sacosCount }),
    });
    setLoading(false);
    if (res.ok) {
      setSacosCount(0);
      router.refresh();
    } else {
      alert("Erro ao registrar");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Sacos comprados esta semana</label>
        <input
          type="number"
          min={1}
          className="input-field"
          required
          value={sacosCount || ""}
          onChange={(e) => setSacosCount(Number(e.target.value))}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        Registrar
      </button>
    </form>
  );
}
