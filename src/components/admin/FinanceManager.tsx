"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Calendar, TrendingDown, DollarSign, Package, Info, Calculator, RefreshCw } from "lucide-react";
import { useConfirm } from "@/components/ConfirmModal";

type Investment = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
};

type StockBreakdownItem = {
  categoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  productName: string;
  productId: string | null;
  pricingSource: "LOJA_PRICE_ATACADO" | "PRICE_ATACADO" | "LOJA_PRICE" | "PRICE" | "NENHUM";
  productPackPrice: number;
  productSacosPerUnit: number;
  conversionFormula: string;
  updatedAt: string | null;
  candidateCount: number;
  warningMulti: boolean;
  productCategory: string;
};

type Summary = {
  totalSales: number;
  totalInvestments: number;
  stockValue: number;
  pendingOrders: number;
  stockBreakdown?: StockBreakdownItem[];
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

  const [summary, setSummary] = useState<Summary & { generatedAt?: string | null }>({
    totalSales: 0,
    totalInvestments: 0,
    stockValue: 0,
    pendingOrders: 0,
    stockBreakdown: [],
    generatedAt: null,
  });

  const [refreshNonce, setRefreshNonce] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const nonce = `${Date.now()}_${Math.random().toString(36).slice(2)}_${++refreshNonce}`;
      const noCacheInit: RequestInit = {
        cache: "reload",
        credentials: "include",
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "X-No-Cache": "1",
          "X-Refresh-Nonce": nonce,
        },
        // @ts-ignore
        next: { revalidate: 0, tags: [`finance-refresh-${nonce}`] },
      };
      const ts = `&_t=${nonce}`;
      const [invRes, summaryRes] = await Promise.all([
        fetch(`/api/admin/investments?from=${dates.from}&to=${dates.to}${ts}`, noCacheInit),
        fetch(`/api/admin/finance/summary?from=${dates.from}&to=${dates.to}${ts}`, noCacheInit),
      ]);

      if (invRes.ok) setInvestments(await invRes.json());
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary({
          totalSales: data.totalSales || 0,
          totalInvestments: data.totalInvestments || 0,
          stockValue: data.stockValue || 0,
          pendingOrders: data.pendingOrders || 0,
          stockBreakdown: data.stockBreakdown || [],
          generatedAt: data.generatedAt || null,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
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

  const handleResetSales = async () => {
    const ok = await confirm(
      "Zerar Vendas do Período?",
      `Tem certeza que quer zerar todas as vendas confirmadas entre ${dates.from} e ${dates.to}? Essa ação é irreversível!`,
      "danger"
    );
    if (!ok) return;

    try {
      const res = await fetch("/api/admin/reset-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetOnlySales: true, from: dates.from, to: dates.to }),
      });
      if (res.ok) {
        alert("Vendas do período zeradas com sucesso!");
        fetchData();
      }
    } catch (e) {
      alert("Erro ao zerar vendas");
    }
  };

  const badgeSource = (s: StockBreakdownItem["pricingSource"]) => {
    switch (s) {
      case "LOJA_PRICE_ATACADO":
        return { label: "✅ PREÇO LOJISTA (ATACADO)", bg: "bg-green-100", txt: "text-green-800", border: "border-green-200" };
      case "PRICE_ATACADO":
        return { label: "⚠️ Preço normal atacado (sem lojaPrice)", bg: "bg-yellow-100", txt: "text-yellow-800", border: "border-yellow-200" };
      case "LOJA_PRICE":
        return { label: "✅ PREÇO LOJISTA EXCLUSIVO (VAREJO)", bg: "bg-emerald-100", txt: "text-emerald-800", border: "border-emerald-200" };
      case "PRICE":
        return { label: "⚠️ Preço normal Varejo (sem Preço Lojista)", bg: "bg-orange-100", txt: "text-orange-800", border: "border-orange-200" };
      default:
        return { label: "❌ Sem preço definido", bg: "bg-red-100", txt: "text-red-800", border: "border-red-200" };
    }
  };

  const breakdown = summary.stockBreakdown || [];
  const totalQtdBreakdown = breakdown.reduce((a, b) => a + b.quantity, 0);

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

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="px-4 py-2 border-2 border-blue-300 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "ATUALIZANDO..." : "🔄 ATUALIZAR"}
          </button>
          <button
            onClick={handleResetSales}
            className="px-4 py-2 border border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
          >
            ZERAR VENDAS DO PERÍODO
          </button>
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
        <div className="bg-white p-6 rounded-3xl border shadow-sm ring-2 ring-blue-200 relative">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Valor em Estoque</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(summary.stockValue)}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                {totalQtdBreakdown.toLocaleString("pt-BR")} pacotes · {breakdown.length} categoria(s)
              </p>
            </div>
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

      {/* DETALHAMENTO DO VALOR EM ESTOQUE */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-br from-blue-50 to-white">
          <div>
            <h3 className="font-black text-[var(--zice-dark)] flex items-center gap-2 text-lg">
              <Calculator size={20} className="text-blue-600" />
              Cálculo do Valor em Estoque (1 Pacote Unitário)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              <strong className="text-emerald-700">🔝 PRIORIDADE MÁXIMA:</strong> Produto com <strong>PREÇO LOJISTA EXCLUSIVO</strong> preenchido (não importa se é VAREJO ou ATACADO — esse é o que usa!)<br/>
              <strong>Depois:</strong> Produto MAIS RECENTEMENTE EDITADO (sempre o último salvo)<br/>
              <strong className="text-amber-600">Clique em "✏️ EDITAR PRODUTO" abaixo para mudar o preço na hora ↓</strong>
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2 text-[11px]">
            <div className="flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-2xl border border-blue-100">
              <Info size={14} className="text-blue-600" />
              <span className="text-gray-600">
                Total Geral: <span className="text-blue-700 text-base">{formatCurrency(summary.stockValue)}</span>
              </span>
            </div>
            {summary.generatedAt && (
              <div className="font-semibold text-gray-500">
                ✨ Cálculo gerado em: <span className="text-blue-700 font-black">
                  {new Date(summary.generatedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-4">🧊 Categoria / Produto</th>
                <th className="px-4 py-4 text-right">Estoque (pacotes)</th>
                <th className="px-4 py-4 text-right">
                  Preço Pacote<br />
                  <span className="text-[9px] font-normal normal-case text-gray-400">(Atacado)</span>
                </th>
                <th className="px-4 py-4 text-right">
                  Unid. por<br />Pacote
                </th>
                <th className="px-4 py-4 text-right">
                  ✅ Preço 1 Unitário<br />
                  <span className="text-[9px] font-normal normal-case text-gray-400">(R$ pacote ÷ unid.)</span>
                </th>
                <th className="px-4 py-4 text-right">Fórmula Final</th>
                <th className="px-4 py-4 text-right">Total (R$)</th>
                <th className="px-4 py-4 text-center">Ações / Data</th>
                <th className="px-4 py-4">Garantia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-400 italic">
                    Nenhuma categoria com estoque. Adicione produção no menu <strong>Estoque</strong>.
                  </td>
                </tr>
              ) : (
                breakdown.map((item) => {
                  const b = badgeSource(item.pricingSource);
                  return (
                    <tr
                      key={item.categoryId}
                      className={`transition-colors ${item.warningMulti ? 'bg-amber-50/40 hover:bg-amber-100/50' : 'hover:bg-blue-50/30'}`}
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-[var(--zice-dark)]">🧊 {item.categoryName}</p>
                        <p className="text-[11px] text-gray-700 mt-0.5 font-bold truncate max-w-[300px]">
                          📦 {item.productName}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            (item.productCategory || "").toUpperCase() === "VAREJO"
                              ? "bg-sky-100 text-sky-800 border-sky-200"
                              : "bg-pink-100 text-pink-800 border-pink-200"
                          }`}>
                            📁 {item.productCategory || "-"}
                          </span>
                        </div>
                        {item.warningMulti && (
                          <p className="mt-2 text-[10px] font-black uppercase text-amber-700 bg-amber-100/70 border border-amber-200 px-2 py-1 rounded-lg inline-block">
                            ⚠️ {item.candidateCount} produtos ATIVOS nesta categoria! Desative os antigos em Admin → Produtos para evitar dúvidas.
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-right text-[var(--zice-dark)]">
                        {item.quantity.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-right text-gray-700">
                        {item.unitPrice > 0 ? (
                          <span className="line-through decoration-orange-400/70 decoration-2 decoration-slice">
                            {formatCurrency(item.productPackPrice)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-center text-purple-700">
                        {item.unitPrice > 0 ? (
                          <span className="bg-purple-50 px-2.5 py-1 rounded-xl border-2 border-purple-100 inline-block min-w-[48px]">
                            × {item.productSacosPerUnit}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-right text-blue-600">
                        {item.unitPrice > 0 ? (
                          <span>
                            {formatCurrency(item.unitPrice)}
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5 font-semibold normal-case">
                              {item.conversionFormula}
                            </p>
                          </span>
                        ) : (
                          <span className="text-red-500">sem preço</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[11px] text-gray-600 text-right font-mono whitespace-nowrap">
                        {item.unitPrice > 0 ? (
                          <span className="bg-green-50 px-3 py-2 rounded-xl border-2 border-green-200 inline-block font-black text-green-800">
                            {item.quantity.toLocaleString("pt-BR")} × {formatCurrency(item.unitPrice)}
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-base font-black text-right text-blue-700">
                        {item.unitPrice > 0 ? (
                          <span className="bg-blue-50 px-3 py-1.5 rounded-2xl border-2 border-blue-200 inline-block min-w-[120px]">
                            {formatCurrency(item.totalValue)}
                          </span>
                        ) : (
                          <span className="text-red-500">R$ 0,00</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-[11px] space-y-1">
                        {item.productId ? (
                          <a
                            href={`/admin/produtos/${item.productId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block w-full px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase transition-colors border-2 border-blue-400 shadow-sm hover:shadow-md"
                          >
                            ✏️ EDITAR PRODUTO
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">sem produto</span>
                        )}
                        {item.updatedAt && (
                          <p className="mt-1 text-[10px] font-bold text-gray-500">
                            Atualizado:
                            <br />
                            <span className="text-gray-700 font-black">
                              {new Date(item.updatedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                            </span>
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full border uppercase ${b.bg} ${b.txt} ${b.border}`}>
                          {b.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {breakdown.length > 0 && (
              <tfoot className="bg-blue-50/60 font-black text-[var(--zice-dark)]">
                <tr>
                  <td className="px-4 py-4 text-right text-sm text-gray-500 uppercase tracking-wider">
                    TOTAIS →
                  </td>
                  <td className="px-4 py-4 text-right text-lg">
                    {totalQtdBreakdown.toLocaleString("pt-BR")} pacotes
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-gray-400"></td>
                  <td className="px-4 py-4 text-right text-xs text-gray-400"></td>
                  <td className="px-4 py-4 text-right text-xs text-gray-400">
                    (média ponderada)
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-gray-400">
                    soma de todas as categorias
                  </td>
                  <td className="px-4 py-4 text-right text-3xl text-blue-700">
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl inline-block">
                      {formatCurrency(summary.stockValue)}
                    </span>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="p-4 bg-emerald-50 border-t border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
          <Info size={18} className="flex-shrink-0 mt-0.5 text-emerald-600" />
          <div className="space-y-2">
            <p className="font-black text-emerald-800 text-sm">
              ✅ COMO FUNCIONA (100% do SEU JEITO):
            </p>
            <ol className="list-decimal pl-5 space-y-1 font-semibold">
              <li>
                🥇 <strong>É USADO SEMPRE o produto com PREÇO LOJISTA EXCLUSIVO</strong> preenchido (campo "Preço Lojista Exclusivo (R$)" na edição do produto) — não importa se categoria é <strong>VAREJO</strong> ou <strong>ATACADO</strong>.
              </li>
              <li>
                🆕 <strong>Desempate: o MAIS RECENTEMENTE EDITADO GANHA!</strong>
                Se tem +1 produto com preço lojista preenchido na mesma categoria (3kg/5kg/10kg), SEMPRE usa o último que VOCÊ SALVOU! (Produtos de dias antigos nunca vencem um salvo hoje.)
              </li>
              <li>
                💡 Exemplo seu: 3kg = R$ 4,00 (VAREJO) / 5kg = R$ 6,50 (VAREJO). Salve esses 2 produtos HOJE → eles viram os mais novos na categoria e são usados imediatamente no cálculo!
              </li>
              <li>
                ⚠️ <strong>Se ainda estiver aparecendo produto antigo (datas de julho/ago):</strong> abra o produto VAREJO que tem o preço que você quer → altere 1 centavo do preço lojista, salve. Ele passa a ser o MAIS NOVO e ganha 100%!
              </li>
            </ol>
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
