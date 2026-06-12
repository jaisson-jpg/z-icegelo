"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type StockCategory = { id: string; name: string; description: string | null };

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
  isComingSoon: boolean;
  imageUrl: string | null;
  stockCategoryId?: string | null;
};

export function ProductForm({ product }: { product?: ProductFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stockCategories, setStockCategories] = useState<StockCategory[]>([]);

  useEffect(() => {
    setMounted(true);
    // Carregar categorias de estoque
    fetch("/api/admin/stock-categories")
      .then((res) => res.json())
      .then((data) => setStockCategories(data))
      .catch(console.error);
  }, []);

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
    isComingSoon: product?.isComingSoon ?? false,
    imageUrl: product?.imageUrl ?? "",
    stockCategoryId: product?.stockCategoryId ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== "imageUrl") fd.append(k, String(v));
    });
    fd.append("active", String(form.active));
    fd.append("isComingSoon", String(form.isComingSoon));
    fd.append("imageUrl", form.imageUrl);
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
    : form.imageUrl;

  if (!mounted) return <div className="bg-white rounded-xl border p-6 h-[600px] animate-pulse" />;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 sm:p-6 space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-2">Imagem do produto</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="rounded-xl object-cover w-28 h-28 border"
            />
          ) : (
            <div className="w-28 h-28 ice-gradient rounded-xl flex items-center justify-center text-4xl">
              🧊
            </div>
          )}
          <div className="flex-1 space-y-3">
            <label className="flex items-center gap-2 btn-outline cursor-pointer text-sm w-fit">
              <span>📤</span>
              Escolher arquivo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>
            <p className="text-[10px] text-blue-600 font-bold bg-blue-50 p-1 px-2 rounded-md inline-block">
              ✓ TAMANHO RECOMENDADO: QUADRADA (Ex: 500x500px)
            </p>
            <div>
              <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Ou cole um link de imagem:</p>
              <input
                type="text"
                placeholder="https://exemplo.com/imagem.jpg"
                className="input-field text-xs py-2"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
          </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <label className="block text-sm font-medium mb-1">Grupo de Estoque (Peso)</label>
          <select
            className="input-field"
            value={form.stockCategoryId || ""}
            onChange={(e) =>
              setForm({ ...form, stockCategoryId: e.target.value || null })
            }
          >
            <option value="">Nenhum (estoque individual)</option>
            {stockCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {form.stockCategoryId ? (
          <div>
            <label className="block text-sm font-medium mb-1">Estoque da Categoria</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              {stockCategories.find(c => c.id === form.stockCategoryId)?.quantity ?? 0} unidades
              <p className="text-[10px] text-gray-400 mt-1">
                Para alterar o estoque, edite a categoria diretamente na página de Estoque.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Estoque Individual*</label>
            <input
              type="number"
              min="0"
              className="input-field"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>
        )}
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

      <div className="flex flex-col gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Status e Visibilidade</h3>
        
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/50 rounded-lg transition-colors">
          <input
            type="checkbox"
            className="w-5 h-5 accent-[var(--zice-medium)]"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--zice-dark)] uppercase">Produto Ativo</span>
            <span className="text-[10px] text-gray-500">Se desmarcado, o produto desaparece da loja.</span>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <label className={cn(
            "flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all",
            form.isComingSoon ? "bg-orange-100 border-orange-400" : "bg-white border-gray-100"
          )}>
            <input
              type="checkbox"
              className="w-5 h-5 accent-orange-500"
              checked={form.isComingSoon}
              onChange={(e) => setForm({ ...form, isComingSoon: e.target.checked })}
            />
            <div className="flex flex-col">
              <span className="text-sm font-black text-orange-700 uppercase">Tarja EM BREVE</span>
              <span className="text-[10px] text-orange-600/70 leading-tight">Exibe uma faixa laranja no produto.</span>
            </div>
          </label>

          <button
            type="button"
            onClick={() => setForm({ ...form, stock: 0 })}
            className={cn(
              "flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all text-left",
              form.stock <= 0 ? "bg-red-100 border-red-400" : "bg-white border-gray-100"
            )}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.stock <= 0 ? "border-red-500 bg-red-500" : "border-gray-300"}`}>
              {form.stock <= 0 && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-red-700 uppercase">Tarja ESGOTADO</span>
              <span className="text-[10px] text-red-600/70 leading-tight">Zera o estoque e exibe faixa vermelha.</span>
            </div>
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
        {loading ? "Salvando..." : product ? "Atualizar Produto" : "Criar Produto"}
      </button>
    </form>
  );
}
