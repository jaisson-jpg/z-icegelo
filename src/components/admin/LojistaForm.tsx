"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

type LojistaData = {
  id: string;
  businessName: string;
  cnpj: string | null;
  address: string;
  city: string;
  state: string;
  sacosGratisMeta: number;
  sacosComprados: number;
  active: boolean;
  notes: string | null;
  user: { name: string; email: string; phone: string | null };
};

export function LojistaForm({ lojista }: { lojista?: LojistaData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: lojista?.businessName ?? "",
    name: lojista?.user.name ?? "",
    email: lojista?.user.email ?? "",
    phone: lojista?.user.phone ?? "",
    password: "",
    cnpj: lojista?.cnpj ?? "",
    address: lojista?.address ?? "",
    city: lojista?.city ?? "Guaramirim",
    state: lojista?.state ?? "SC",
    sacosGratisMeta: lojista?.sacosGratisMeta ?? 100,
    sacosComprados: lojista?.sacosComprados ?? 0,
    active: lojista?.active ?? true,
    notes: lojista?.notes ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = lojista
      ? `/api/admin/lojistas/${lojista.id}`
      : "/api/admin/lojistas";
    const res = await fetch(url, {
      method: lojista ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/lojistas");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao salvar");
    }
  };

  const handleDelete = async () => {
    if (!lojista || !confirm("Tem certeza que deseja excluir este lojista? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/lojistas/${lojista.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/lojistas");
      router.refresh();
    } else {
      setLoading(false);
      alert("Erro ao excluir lojista");
    }
  };

  const fields: Array<{ key: keyof typeof form; label: string; type?: string }> = [
    { key: "businessName", label: "Nome do estabelecimento *" },
    { key: "name", label: "Nome do responsável *" },
    { key: "email", label: "E-mail de acesso *", type: "email" },
    { key: "phone", label: "Telefone" },
    ...(!lojista ? [{ key: "password" as const, label: "Senha de acesso *", type: "password" }] : []),
    { key: "cnpj", label: "CNPJ" },
    { key: "address", label: "Endereço *" },
    { key: "city", label: "Cidade" },
    { key: "state", label: "Estado" },
    { key: "sacosGratisMeta", label: "Meta sacos para grátis", type: "number" },
    { key: "sacosComprados", label: "Sacos no ciclo atual", type: "number" },
    { key: "notes", label: "Observações" },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4 max-w-lg">
      {fields.map(({ key, label, type }) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <input
            type={type || "text"}
            className="input-field"
            required={["businessName", "name", "email", "address"].includes(key)}
            value={String(form[key])}
            onChange={(e) =>
              setForm({
                ...form,
                [key]: type === "number" ? Number(e.target.value) : e.target.value,
              })
            }
          />
        </div>
      ))}
      {lojista && (
        <div>
          <label className="block text-sm font-medium mb-1">Nova senha (deixe vazio para manter)</label>
          <input
            type="password"
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <span className="text-sm">Lojista ativo</span>
      </label>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Salvando..." : "Salvar"}
      </button>
      {lojista && (
        <div className="pt-6 mt-6 border-t border-red-100">
          <h3 className="text-sm font-bold text-red-600 mb-2 uppercase">Zona de Perigo</h3>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition text-sm font-bold"
          >
            <Trash2 size={18} />
            EXCLUIR LOJISTA PERMANENTEMENTE
          </button>
        </div>
      )}
    </form>
  );
}
