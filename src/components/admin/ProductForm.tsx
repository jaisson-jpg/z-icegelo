"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

export type ProductFormData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  category: "VAREJO" | "ATACADO";
  pointsEarn: number;
  sortOrder: number;
  stock: number;
  sacosPerUnit: number;
  active: boolean;
  imageUrl: string | null;
};

export function ProductForm({ product }: { product?: ProductFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    unit: product?.unit ?? "saco",
    category: product?.category ?? ("VAREJO" as "VAREJO" | "ATACADO"),
    pointsEarn: product?.pointsEarn ?? 0,
    sortOrder: product?.sortOrder ?? 0,
    stock: product?.stock ?? 0,
    sacosPerUnit: product?.sacosPerUnit ?? 1,
    active: product?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("active", String(form.active));
    if (imageFile) fd.append("image", imageFile);

    const url = product
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const res = await fetch(url, {
      method: product ? "PATCH" : "POST",
      body: fd,
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin/produtos");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao salvar produto");
    }
  };

  const preview = imageFile
    ? URL.createObjectURL(imageFile)
    : product?.imageUrl;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 sm:p-6 space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-2">Imagem do produto</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={120}
              height={120}
              className="rounded-xl object-cover w-28 h-28 border"
            />
          ) : (
            <div className="w-28 h-28 ice-gradient rounded-xl flex items-center justify-center text-4xl">
              🧊
            </div>
          )}
          <label className="flex items-center gap-2 btn-outline cursor-pointer text-sm">
            <Upload size={18} />
            Escolher imagem
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nome do produto *</label>
        <input
          className="input-field"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          className="input-field min-h-[80px]"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input-field"
            required
            value={form.price || ""}
            onChange={(e) => {
              const price = parseFloat(e.target.value) || 0;
              setForm({
                ...form,
                price,
                pointsEarn: product ? form.pointsEarn : Math.round(price),
              });
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estoque disponível *</label>
          <input
            type="number"
            min="0"
            className="input-field"
            required
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sacos por unidade</label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={form.sacosPerUnit}
            onChange={(e) => setForm({ ...form, sacosPerUnit: Number(e.target.value) })}
          />
          <p className="text-xs text-gray-500 mt-1">Ex: pacote 20 sacos = 20</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unidade</label>
          <input
            className="input-field"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoria *</label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as "VAREJO" | "ATACADO" })
            }
          >
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pontos Z-ice</label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={form.pointsEarn}
            onChange={(e) => setForm({ ...form, pointsEarn: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ordem na loja</label>
          <input
            type="number"
            className="input-field"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <span className="text-sm">Produto ativo na loja</span>
      </label>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}
        </button>
        <button type="button" onClick={() => router.push("/admin/produtos")} className="btn-outline">
          Cancelar
        </button>
      </div>
    </form>
  );
}
