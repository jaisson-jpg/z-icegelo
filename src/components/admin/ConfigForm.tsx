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
  announcementTitle: string | null;
  announcementText: string | null;
  announcementActive: boolean;
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
    announcementTitle: config?.announcementTitle ?? "",
    announcementText: config?.announcementText ?? "",
    announcementActive: config?.announcementActive ?? false,
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

      <div className="pt-8 mt-8 border-t border-blue-100">
        <h3 className="font-bold text-lg text-[var(--zice-dark)] mb-4">Aviso Global (Notificação)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Este aviso aparecerá para todos os clientes e lojistas ao abrirem o site.
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              className="w-5 h-5 text-[var(--zice-medium)]"
              checked={form.announcementActive}
              onChange={(e) => setForm({ ...form, announcementActive: e.target.checked })}
            />
            <span className="font-bold text-[var(--zice-dark)]">ATIVAR NOTIFICAÇÃO NO SITE</span>
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Título do Aviso</label>
            <input
              className="input-field"
              placeholder="Ex: Promoção de Inverno!"
              value={form.announcementTitle}
              onChange={(e) => setForm({ ...form, announcementTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Texto do Aviso</label>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Ex: Ganhe 10% de desconto em compras acima de 10 sacos..."
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
