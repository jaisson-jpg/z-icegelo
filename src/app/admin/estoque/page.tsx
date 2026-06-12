"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StockCategory = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  products: { id: string; name: string; price: number; stock: number }[];
};

export default function EstoquePage() {
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", quantity: 0 });

  // Carregar categorias de estoque
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stock-categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/admin/stock-categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/admin/stock-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setShowAddModal(false);
      setFormData({ name: "", description: "", quantity: 0 });
      setEditingId(null);
      loadCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir essa categoria de estoque?")) {
      await fetch(`/api/admin/stock-categories/${id}`, { method: "DELETE" });
      loadCategories();
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-2">Estoque</h1>
          <p className="text-sm text-gray-600">
            Gerencie o estoque por grupos de peso (3kg, 5kg, 10kg, etc). Vendas diminuem o estoque automaticamente!
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Nova Categoria (Peso)
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--zice-dark)]">{cat.name}</h3>
                {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setFormData({
                      name: cat.name,
                      description: cat.description || "",
                      quantity: cat.quantity,
                    });
                    setShowAddModal(true);
                  }}
                  className="text-sm text-[var(--zice-medium)] hover:underline font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Estoque Disponível</span>
                <span
                  className={`text-3xl font-black ${
                    cat.quantity <= 0 ? "text-red-600" : cat.quantity <= 10 ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {cat.quantity}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    cat.quantity <= 0 ? "bg-red-400" : cat.quantity <= 10 ? "bg-yellow-400" : "bg-green-400"
                  }`}
                  style={{ width: `${Math.min(100, cat.quantity)}%` }}
                ></div>
              </div>
            </div>

            {cat.products.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Produtos Nesse Grupo</p>
                <div className="flex flex-wrap gap-2">
                  {cat.products.map((p) => (
                    <div
                      key={p.id}
                      className="px-3 py-2 bg-gray-50 rounded-lg text-sm border"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-gray-500 ml-2">({formatCurrency(p.price)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {!loading && categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border">
            <p className="text-gray-500 mb-4">Nenhuma categoria de estoque criada!</p>
            <p className="text-sm text-gray-400">Comece criando grupos como "3kg", "5kg" e "10kg".</p>
          </div>
        )}
      </div>

      {/* Modal de adicionar/editar */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[var(--zice-dark)]">
              {editingId ? "Editar Categoria de Estoque" : "Nova Categoria de Estoque"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome (ex: "5kg", "10kg")
                </label>
                <input
                  required
                  type="text"
                  className="input-field w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="3kg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Quantidade em Estoque
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  className="input-field w-full"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: "", description: "", quantity: 0 });
                    setEditingId(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
