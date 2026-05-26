"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Config = {
  pixKey: string;
  pixHolder: string;
  whatsapp: string;
  instagramUrl: string;
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
    instagramUrl: config?.instagramUrl ?? "",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Pagamento */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-[var(--zice-dark)] border-b pb-2">Pagamento e Contato</h3>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Chave PIX</label>
            <input
              className="input-field"
              value={form.pixKey}
              onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Titular PIX</label>
            <input
              className="input-field"
              value={form.pixHolder}
              onChange={(e) => setForm({ ...form, pixHolder: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">WhatsApp (com DDI 55)</label>
            <input
              className="input-field"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Link do Instagram</label>
            <input
              className="input-field"
              placeholder="https://instagram.com/zicegelo"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Card de Fidelidade */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-[var(--zice-dark)] border-b pb-2">Regras de Fidelidade (Padrão)</h3>
          <p className="text-xs text-gray-500 italic">Estes valores serão usados para novos lojistas, mas você pode ajustar cada lojista individualmente na lista de lojistas.</p>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mb-2">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Dica de Gestão</p>
            <p className="text-xs text-blue-800">Para colocar tarjas de <strong>"ESGOTADO"</strong> ou <strong>"EM BREVE"</strong> nos produtos, edite o produto desejado na aba <a href="/admin/produtos" className="underline font-bold">Produtos</a>.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Pontos por R$ 1 gastos</label>
            <input
              type="number"
              className="input-field"
              value={form.pointsPerReal}
              onChange={(e) => setForm({ ...form, pointsPerReal: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Meta sacos padrão (lojistas)</label>
            <input
              type="number"
              className="input-field"
              value={form.sacosGratisMeta}
              onChange={(e) => setForm({ ...form, sacosGratisMeta: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Sacos grátis ao bater meta</label>
            <input
              type="number"
              className="input-field"
              value={form.sacosGratisReward}
              onChange={(e) => setForm({ ...form, sacosGratisReward: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Card de Dados da Empresa */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-bold text-lg text-[var(--zice-dark)] border-b pb-2">Dados da Empresa (Faturamento/NF)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Razão Social</label>
              <input
                className="input-field"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">CNPJ</label>
              <input
                className="input-field"
                value={form.companyCnpj}
                onChange={(e) => setForm({ ...form, companyCnpj: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Endereço Completo</label>
              <input
                className="input-field"
                value={form.companyAddress}
                onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Telefone Comercial</label>
              <input
                className="input-field"
                value={form.companyPhone}
                onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">E-mail Comercial</label>
              <input
                className="input-field"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Card de Notificação */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-bold text-lg text-[var(--zice-dark)] border-b border-blue-200 pb-2">Aviso Global (Notificação no Site)</h3>
          <label className="flex items-center gap-3 p-4 bg-white rounded-xl border cursor-pointer hover:bg-gray-50 transition">
            <input
              type="checkbox"
              className="w-5 h-5 accent-[var(--zice-medium)]"
              checked={form.announcementActive}
              onChange={(e) => setForm({ ...form, announcementActive: e.target.checked })}
            />
            <span className="font-bold text-[var(--zice-dark)]">EXIBIR AVISO NO TOPO DO SITE</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Título do Aviso</label>
              <input
                className="input-field"
                placeholder="Ex: Promoção de Inverno!"
                value={form.announcementTitle}
                onChange={(e) => setForm({ ...form, announcementTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Texto do Aviso</label>
              <textarea
                className="input-field min-h-[46px]"
                placeholder="Ex: Ganhe 10% de desconto em compras acima de 10 sacos..."
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary px-10 py-4 text-lg shadow-xl hover:scale-105 transition-transform"
        >
          {loading ? "Salvando alterações..." : "Salvar todas as configurações"}
        </button>
      </div>
    </form>
  );
}
