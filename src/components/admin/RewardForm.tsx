"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

type RewardData = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  targetType: "POINTS" | "SACOS";
  targetValue: number;
  rewardLabel: string;
  audience: "VAREJO" | "ATACADO" | "TODOS";
  sortOrder: number;
  active: boolean;
};

export function RewardForm({ reward }: { reward?: RewardData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: reward?.name ?? "",
    description: reward?.description ?? "",
    targetType: reward?.targetType ?? ("SACOS" as "POINTS" | "SACOS"),
    targetValue: reward?.targetValue ?? 100,
    rewardLabel: reward?.rewardLabel ?? "",
    audience: reward?.audience ?? ("TODOS" as "VAREJO" | "ATACADO" | "TODOS"),
    sortOrder: reward?.sortOrder ?? 0,
    active: reward?.active ?? true,
  });

  const preview = imageFile ? URL.createObjectURL(imageFile) : reward?.imageUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("active", String(form.active));
    if (imageFile) fd.append("image", imageFile);

    const url = reward ? `/api/admin/rewards/${reward.id}` : "/api/admin/rewards";
    const res = await fetch(url, { method: reward ? "PATCH" : "POST", body: fd });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/recompensas");
      router.refresh();
    } else {
      alert("Erro ao salvar");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 sm:p-6 space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-2">Imagem do prêmio</label>
        <div className="flex gap-4 items-start">
          {preview ? (
            <Image src={preview} alt="" width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
          ) : (
            <div className="w-20 h-20 bg-[var(--zice-ice)] rounded-lg flex items-center justify-center text-2xl">🎁</div>
          )}
          <label className="btn-outline text-sm cursor-pointer flex items-center gap-1">
            <Upload size={16} /> Imagem
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nome do prêmio *</label>
        <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea className="input-field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de meta *</label>
          <select className="input-field" value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value as "POINTS" | "SACOS" })}>
            <option value="SACOS">Sacos comprados (atacado)</option>
            <option value="POINTS">Pontos (varejo)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta para ganhar *</label>
          <input type="number" min={1} className="input-field" required value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">O que ganha (texto) *</label>
        <input className="input-field" required placeholder="Ex: 5 sacos de gelo grátis" value={form.rewardLabel} onChange={(e) => setForm({ ...form, rewardLabel: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Público</label>
          <select className="input-field" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as typeof form.audience })}>
            <option value="TODOS">Todos</option>
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ordem</label>
          <input type="number" className="input-field" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        </div>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
        <span className="text-sm">Ativo no site</span>
      </label>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Salvando..." : reward ? "Salvar" : "Cadastrar prêmio"}
      </button>
    </form>
  );
}
