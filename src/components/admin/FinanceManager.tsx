"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Calendar, TrendingDown, DollarSign, Package } from "lucide-react";
import { useConfirm } from "@/components/ConfirmModal";

type Investment = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
};

type Summary = {
  totalSales: number;
  totalInvestments: number;
  stockValue: number;
  pendingOrders: number;
};

export function FinanceManager() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { confirm, ConfirmComponent } = useConfirm();
  const [dates, setDates] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "EQUIPAMENTO",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [summary, setSummary] = useState<Summary>({
    totalSales: 0,
    totalInvestments: 0,
    stockValue: 0,
    pendingOrders: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, summaryRes] = await Promise.all([
        fetch(`/api/admin/investments?from=${dates.from}&to=${dates.to}`),
        fetch(`/api/admin/finance/summary?from=${dates.from}&to=${dates.to}`),
      ]);

      if (invRes.ok) setInvestments(await invRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/investments", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddForm(false);
        setForm({ name: "", amount: "", category: "EQUIPAMENTO", description: "", date: new Date().toISOString().split('T')[0] });
        fetchData();
      }
    } catch (e) {
      alert("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm("Excluir Investimento?", `Deseja remover o registro de "${name}"?`, "danger");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/investments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      alert("Erro ao excluir");
    }
  };

  const handleResetData = async () => {
    const ok = await confirm(
      "Zerar Dados?", 
      "Tem certeza que quer zerar todos os dados de estoque, investimentos, pontos e sacos dos lojistas? Essa ação é irreversível!", 
      "danger"
    );
    if (!ok) return;

    try {
      const res = await fetch("/api/admin/reset-data", { method: "POST" });
      if (res.ok) {
        alert("Dados zerados com sucesso!");
        fetchData();
      }
    } catch (e) {
      alert("Erro ao zerar dados");
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmComponent />
      
      {/* Filtros e Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2 px-3">
            <Calendar size={18} className="text-gray-400" />
            <input 
              type="date" 
              className="text-sm font-bold bg-transparent border-none focus:ring-0 p-0"
              value={dates.from}
              onChange={(e) => setDates({...dates, from: e.target.value})}
            />
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 px-3">
            <input 
              type="date" 
              className="text-sm font-bold bg-transparent border-none focus:ring-0 p-0"
              value={dates.to}
              onChange={(e) => setDates({...dates, to: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleResetData}
            className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
          >
            ZERAR DADOS
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            <Plus size={20} /> REGISTRAR INVESTIMENTO
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Vendas no Período</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-green-600">{formatCurrency(summary.totalSales)}</p>
            <div className="p-2 bg-green-50 rounded-xl text-green-600"><TrendingDown className="rotate-180" size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Investimentos</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-red-600">{formatCurrency(summary.totalInvestments)}</p>
            <div className="p-2 bg-red-50 rounded-xl text-red-600"><TrendingDown size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Valor em Estoque</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-blue-600">{formatCurrency(summary.stockValue)}</p>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Package size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Balanço Final</p>
          <div className="flex items-end justify-between">
            <p className={`text-2xl font-black ${summary.totalSales - summary.totalInvestments >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
              {formatCurrency(summary.totalSales - summary.totalInvestments)}
            </p>
            <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><DollarSign size={20} /></div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl border p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-xl mb-6 text-[var(--zice-dark)] flex items-center gap-2">
            🚀 Novo Investimento / Equipamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Nome / Equipamento</label>
              <input 
                required
                className="input-field" 
                placeholder="Ex: Freezer Vertical" 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Valor (R$)</label>
              <input 
                required
                type="number"
                step="0.01"
                className="input-field" 
                placeholder="0,00" 
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Categoria</label>
              <select 
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              >
                <option value="EQUIPAMENTO">EQUIPAMENTO</option>
                <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
                <option value="OPERACIONAL">OPERACIONAL</option>
                <option value="OUTROS">OUTROS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Data da Compra</label>
              <input 
                type="date"
                className="input-field" 
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors">CANCELAR</button>
            <button type="submit" className="btn-primary px-10">SALVAR REGISTRO</button>
          </div>
        </form>
      )}

      {/* Tabela de Investimentos */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-[var(--zice-dark)]">Detalhamento de Investimentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Nome / Item</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Nenhum investimento registrado neste período.</td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{new Date(inv.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--zice-dark)]">{inv.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                        {inv.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-right text-red-600">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(inv.id, inv.name)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
