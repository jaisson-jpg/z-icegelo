"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ArrowUpDown } from "lucide-react";
import { formatCurrency, STOCK_CAPACITY, stockBarPercent } from "@/lib/utils";

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
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [adjustModal, setAdjustModal] = useState<StockCategory | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

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
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
          }),
        });
        showToast("Categoria atualizada!");
      } else {
        await fetch("/api/admin/stock-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        showToast("Categoria criada!");
      }
      setShowAddModal(false);
      setFormData({ name: "", description: "", quantity: 0 });
      setEditingId(null);
      loadCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncrement = async (id: string, rawAmount: string, onDone?: () => void) => {
    const amount = parseInt(rawAmount, 10);
    if (!Number.isFinite(amount) || amount === 0) {
      alert("Digite um número válido. Exemplo: 15 para adicionar 15 pacotes.");
      return;
    }

    setAddingId(id);
    try {
      const res = await fetch(`/api/admin/stock-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: amount }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Não foi possível ajustar o estoque.");
        return;
      }
      const updated: StockCategory = await res.json();
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, quantity: updated.quantity } : cat))
      );
      setAddAmounts((prev) => ({ ...prev, [id]: "" }));
      showToast(
        amount > 0
          ? `✓ +${amount} pacotes adicionados (total: ${updated.quantity})`
          : `✓ ${amount} pacotes removidos (total: ${updated.quantity})`
      );
      onDone?.();
    } catch (e) {
      console.error(e);
      alert("Erro ao ajustar estoque.");
    } finally {
      setAddingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir essa categoria de estoque? Produtos desse grupo ficarão sem estoque agrupado.")) {
      await fetch(`/api/admin/stock-categories/${id}`, { method: "DELETE" });
      loadCategories();
      showToast("Categoria excluída.");
    }
  };

  const barColor = (quantity: number) => {
    if (quantity <= 0) return "bg-red-500";
    if (quantity < STOCK_CAPACITY * 0.1) return "bg-yellow-500";
    if (quantity > STOCK_CAPACITY * 0.95) return "bg-blue-500";
    return "bg-green-500";
  };

  const qtyColor = (quantity: number) => {
    if (quantity <= 0) return "text-red-600";
    if (quantity < STOCK_CAPACITY * 0.1) return "text-yellow-600";
    if (quantity > STOCK_CAPACITY * 0.95) return "text-blue-600";
    return "text-green-600";
  };

  const capacityText = (quantity: number) => {
    if (quantity > STOCK_CAPACITY) return "(acima da capacidade — avise a produção!)";
    if (quantity > STOCK_CAPACITY * 0.95) return "(quando encher — avise o comercial!)";
    if (quantity < STOCK_CAPACITY * 0.1 && quantity > 0) return "(baixo — precisa produzir!)";
    if (quantity <= 0) return "(esgotado!)";
    return "";
  };

  const quickAdd = (id: string, value: number) => {
    setAddAmounts((prev) => ({ ...prev, [id]: String((parseInt(prev[id] || "0", 10) || 0) + value) }));
  };

  return (
    <div className="relative">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[100] bg-[var(--zice-dark)] text-white px-5 py-3 rounded-xl shadow-2xl animate-bounce font-bold text-sm border-2 border-[var(--zice-medium)]">
          {toastMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-2">Estoque</h1>
          <p className="text-sm text-gray-600">
            Cada tamanho comporta até <strong className="text-[var(--zice-dark)]">{STOCK_CAPACITY.toLocaleString("pt-BR")} pacotes</strong>.
            Digite a produção (ex: 15) e clique em <strong>+ Aplicar no Estoque</strong> — o valor <u>somam-se</u> ao que já tem.
            Use <strong>números negativos</strong> para remover pacotes.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Nova Categoria (Peso)
        </button>
      </div>

      {loading && <p className="text-gray-500">Carregando estoque...</p>}

      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => {
          const percent = stockBarPercent(cat.quantity);
          const hasCapacityNote = capacityText(cat.quantity).length > 0;
          return (
            <div key={cat.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className={`px-6 pt-6 pb-4 border-b ${hasCapacityNote ? "bg-amber-50/50" : ""}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-[var(--zice-dark)] flex items-center gap-2">
                      🧊 {cat.name}
                    </h3>
                    {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
                    {hasCapacityNote && (
                      <p className={`text-xs font-bold mt-2 ${qtyColor(cat.quantity)}`}>
                        ⚠️ {capacityText(cat.quantity)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => {
                        setAdjustModal(cat);
                        setAdjustAmount("");
                      }}
                      className="px-3 py-2 text-sm font-bold bg-[var(--zice-ice)] text-[var(--zice-dark)] rounded-xl hover:bg-[var(--zice-light)] transition-colors flex items-center gap-1"
                    >
                      <ArrowUpDown size={16} /> Ajustar
                    </button>
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
                      className="px-3 py-2 text-sm text-[var(--zice-medium)] hover:underline font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Excluir categoria"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-end justify-between mb-2 gap-3">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Estoque Disponível</span>
                      <div className="text-right">
                        <span className={`text-4xl font-black ${qtyColor(cat.quantity)}`}>
                          {cat.quantity.toLocaleString("pt-BR")}
                        </span>
                        <span className="text-sm text-gray-400 font-semibold ml-2">
                          / {STOCK_CAPACITY.toLocaleString("pt-BR")} pacotes
                        </span>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${barColor(cat.quantity)}`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                      {percent.toFixed(1).replace(".", ",")}% da capacidade
                      {cat.quantity > STOCK_CAPACITY && ` · ${(cat.quantity - STOCK_CAPACITY).toLocaleString("pt-BR")} acima do limite`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-[var(--zice-ice)]/40 to-white">
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                  ➕ Lançar Produção do Dia / Ajuste Rápido
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {[10, 25, 50, 100].map((v) => (
                    <button
                      key={`add-${cat.id}-${v}`}
                      type="button"
                      onClick={() => quickAdd(cat.id, v)}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-[var(--zice-dark)] rounded-lg border-2 border-[var(--zice-light)] hover:border-[var(--zice-medium)] hover:bg-[var(--zice-light)] transition-colors"
                    >
                      +{v}
                    </button>
                  ))}
                  <span className="text-xs text-gray-400 self-center mx-1">atalhos:</span>
                  {[-10, -5].map((v) => (
                    <button
                      key={`sub-${cat.id}-${v}`}
                      type="button"
                      onClick={() => quickAdd(cat.id, v)}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-red-600 rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <form
                  className="flex flex-col sm:flex-row gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleIncrement(cat.id, addAmounts[cat.id] ?? "");
                  }}
                >
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="1"
                      inputMode="numeric"
                      className="input-field flex-1 text-lg font-bold text-center pr-16"
                      placeholder="Ex: 15 (soma)  ou  -3 (subtrai)"
                      value={addAmounts[cat.id] ?? ""}
                      onChange={(e) =>
                        setAddAmounts((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Soma / Sub
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={addingId === cat.id}
                    className="btn-primary whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 text-base shadow-lg"
                  >
                    {addingId === cat.id ? (
                      <>⏳ Ajustando...</>
                    ) : (
                      <>
                        <Plus size={18} />
                        Aplicar no Estoque
                      </>
                    )}
                  </button>
                </form>
              </div>

              {cat.products.length > 0 && (
                <div className="px-6 py-4 bg-white border-t">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    📦 Produtos que usam esse grupo
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.products.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-2 bg-white rounded-xl text-sm border border-gray-200 shadow-sm"
                      >
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-gray-500 ml-2 font-bold">({formatCurrency(p.price)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!loading && categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <p className="text-4xl mb-4">🧊</p>
            <p className="text-gray-500 mb-2 font-semibold">Nenhuma categoria de estoque criada!</p>
            <p className="text-sm text-gray-400">Comece criando grupos como "3kg", "5kg" e "10kg".</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[var(--zice-dark)]">
              {editingId ? "✏️ Editar Categoria" : "➕ Nova Categoria de Estoque"}
            </h3>

            {editingId && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border-2 border-blue-200 text-sm text-blue-800">
                💡 <strong>Atenção:</strong> para alterar a <u>quantidade de estoque</u>, feche esta janela
                e use o botão <strong>"Ajustar"</strong> ou o campo <strong>"Aplicar no Estoque"</strong>
                da própria categoria. Aqui só edita nome/descrição.
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome (ex: "5kg", "10kg") *
                </label>
                <input
                  required
                  type="text"
                  className="input-field w-full text-lg"
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
                  placeholder="Ex: Saco de gelo 20x40cm"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Quantidade inicial (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field w-full"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Após criar, use <strong>"Aplicar no Estoque"</strong> para lançar produção diária.
                  </p>
                </div>
              )}
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
                  {editingId ? "Salvar Alterações" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {adjustModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && (setAdjustModal(null), setAdjustAmount(""))}
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg">
            <h3 className="text-xl font-black mb-2 text-[var(--zice-dark)] flex items-center gap-2">
              <ArrowUpDown size={24} className="text-[var(--zice-medium)]" />
              Ajustar Estoque: {adjustModal.name}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Total atual: <span className={`font-black text-xl ${qtyColor(adjustModal.quantity)}`}>
                {adjustModal.quantity.toLocaleString("pt-BR")} pacotes
              </span>
            </p>

            <div className="mb-5 p-4 rounded-2xl bg-green-50 border-2 border-green-200">
              <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-2">
                Opção 1 — Produção / Remessa
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[10, 20, 50, 100, 200].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAdjustAmount(String(v))}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-green-800 rounded-lg border-2 border-green-300 hover:bg-green-100"
                  >
                    +{v}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input-field flex-1 text-center font-bold"
                  placeholder="Qtd a SOMAR (ex: 15)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
                <button
                  type="button"
                  disabled={adjusting}
                  onClick={() => handleIncrement(adjustModal.id, adjustAmount, () => (setAdjustModal(null), setAdjustAmount("")))}
                  className="btn-primary px-5 whitespace-nowrap"
                >
                  <Plus size={18} /> Somar
                </button>
              </div>
            </div>

            <div className="mb-5 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
              <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-2">
                Opção 2 — Perda / Ajuste para Baixo
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[-5, -10, -50].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAdjustAmount(String(v))}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-red-800 rounded-lg border-2 border-red-300 hover:bg-red-100"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input-field flex-1 text-center font-bold"
                  placeholder="Qtd a SUBTRAIR (ex: -3)"
                  value={adjustAmount && parseInt(adjustAmount) > 0 ? `-${adjustAmount}` : adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
                <button
                  type="button"
                  disabled={adjusting}
                  onClick={() => {
                    let v = parseInt(adjustAmount, 10);
                    if (v > 0) v = -v;
                    handleIncrement(adjustModal.id, String(v), () => (setAdjustModal(null), setAdjustAmount("")));
                  }}
                  className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-1"
                >
                  <Minus size={18} /> Subtrair
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
              <button
                type="button"
                onClick={() => { setAdjustModal(null); setAdjustAmount(""); }}
                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
