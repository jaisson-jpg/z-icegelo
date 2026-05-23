"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Config = {
  pixKey: string;
  pixHolder: string;
  whatsapp: string;
  pointsPerReal: number;
  sacosGratisMeta: number;
  sacosGratisReward: number;
  companyName: string;
  companyCnpj: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
} | null;

export function ConfigForm({ config }: { config: Config }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pixKey: config?.pixKey ?? "47996471803",
    pixHolder: config?.pixHolder ?? "Z-ice Gelo",
    whatsapp: config?.whatsapp ?? "5547996471803",
    pointsPerReal: config?.pointsPerReal ?? 1,
    sacosGratisMeta: config?.sacosGratisMeta ?? 100,
    sacosGratisReward: config?.sacosGratisReward ?? 5,
    companyName: config?.companyName ?? "Z-ice Gelo",
    companyCnpj: config?.companyCnpj ?? "",
    companyAddress: config?.companyAddress ?? "Guaramirim - SC",
    companyPhone: config?.companyPhone ?? "47996471803",
    companyEmail: config?.companyEmail ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    router.refresh();
    alert("Configurações salvas!");
  };

  const fields: Array<{ key: keyof typeof form; label: string; type?: string }> = [
    { key: "pixKey", label: "Chave PIX" },
    { key: "pixHolder", label: "Titular PIX" },
    { key: "whatsapp", label: "WhatsApp (com DDI 55)" },
    { key: "pointsPerReal", label: "Pontos por R$ 1", type: "number" },
    { key: "sacosGratisMeta", label: "Meta sacos padrão (lojistas)", type: "number" },
    { key: "sacosGratisReward", label: "Sacos grátis padrão", type: "number" },
    { key: "companyName", label: "Razão social (nota fiscal)" },
    { key: "companyCnpj", label: "CNPJ da empresa" },
    { key: "companyAddress", label: "Endereço da empresa" },
    { key: "companyPhone", label: "Telefone da empresa" },
    { key: "companyEmail", label: "E-mail da empresa" },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 sm:p-6 space-y-4 max-w-lg">
      {fields.map(({ key, label, type }) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <input
            type={type || "text"}
            className="input-field"
            value={form[key]}
            onChange={(e) =>
              setForm({
                ...form,
                [key]: type === "number" ? Number(e.target.value) : e.target.value,
              })
            }
          />
        </div>
      ))}
      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
