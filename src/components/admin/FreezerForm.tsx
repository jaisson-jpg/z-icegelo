"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FreezerForm({ lojistaId }: { lojistaId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    brand: "",
    location: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/lojistas/${lojistaId}/freezers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ code: "", brand: "", location: "", address: "", notes: "" });
      router.refresh();
    } else {
      alert("Erro ao alocar freezer");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
      <input
        className="input-field"
        placeholder="Código do freezer *"
        required
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
      />
      <input
        className="input-field"
        placeholder="Marca"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
      />
      <input
        className="input-field"
        placeholder="Local no estabelecimento *"
        required
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <input
        className="input-field"
        placeholder="Endereço completo"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
        {loading ? "Salvando..." : "Alocar freezer"}
      </button>
    </form>
  );
}
