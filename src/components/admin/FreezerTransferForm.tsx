"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Lojista = { id: string; businessName: string };
type Freezer = {
  id: string;
  code: string;
  brand: string | null;
  location: string;
  address: string | null;
  notes: string | null;
  active: boolean;
  lojistaId: string;
};

export function FreezerTransferForm({
  freezer,
  lojistas,
  onClose,
}: {
  freezer: Freezer;
  lojistas: Lojista[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    lojistaId: freezer.lojistaId,
    location: freezer.location,
    address: freezer.address || "",
    brand: freezer.brand || "",
    notes: freezer.notes || "",
    active: freezer.active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lojistas/${freezer.lojistaId}/freezers/${freezer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lojistaId: form.lojistaId,
          location: form.location,
          address: form.address || null,
          brand: form.brand || null,
          notes: form.notes || null,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(data.error || "Erro ao atualizar freezer");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-[var(--zice-dark)]">
            Trocar / Remanejar freezer {freezer.code}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Novo lojista *</label>
            <select
              className="input-field"
              value={form.lojistaId}
              onChange={(e) => setForm({ ...form, lojistaId: e.target.value })}
              required
            >
              {lojistas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Local no estabelecimento *</label>
            <input
              className="input-field"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Marca</label>
              <input
                className="input-field"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Endereço</label>
              <input
                className="input-field"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Observações</label>
            <input
              className="input-field"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-gray-700">Freezer ativo</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
