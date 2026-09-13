"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Minus, Search, UserCheck, ShoppingBag, Truck, Rocket, BadgeDollarSign, Store, Users, Sparkles, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isLojista: boolean;
  businessName: string | null;
  cnpj: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  weeklyTarget: number | null;
  sacosComprados: number;
  sacosGratis: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  lojaPrice: number | null;
  category: string;
  sacosPerUnit: number;
  stock: number;
  stockCategoryName: string | null;
  pointsEarn: number;
};

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sacosPerUnit: number;
  stockCategoryName: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function ManualOrderModal({ open, onClose, onSuccess }: Props) {
  const [loadingCfg, setLoadingCfg] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formCustomer, setFormCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    cpfCnpj: "",
    address: "",
    deliveryFee: "0",
    needsInvoice: false,
    note: "",
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "ok" | "err"; text: string; details?: string } | null>(null);

  // Carregar configuração inicial (usuários e produtos)
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingCfg(true);
      try {
        const res = await fetch("/api/admin/orders/manual/config");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCfg(false);
      }
    })();
    return () => {
      setSelectedUser(null);
      setItems([]);
      setUserSearch("");
      setProductSearch("");
      setToastMsg(null);
      setFormCustomer({
        name: "", phone: "", email: "", cpfCnpj: "", address: "", deliveryFee: "0", needsInvoice: false, note: "",
      });
    };
  }, [open]);

  // Filtrar usuários com busca
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    let list = users.slice();
    // Prioriza LOJISTAS primeiro (são os que mais pedem WhatsApp)
    list.sort((a, b) => {
      if (a.isLojista && !b.isLojista) return -1;
      if (!a.isLojista && b.isLojista) return 1;
      return a.name.localeCompare(b.name);
    });
    if (!q) return list.slice(0, 80);
    return list.filter((u) =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.businessName || "").toLowerCase().includes(q) ||
      (u.cnpj || "").includes(q)
    );
  }, [users, userSearch]);

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    // Prioriza ATACADO primeiro (lojistas compram atacado)
    let list = products.slice().sort((a, b) => {
      if (a.category === "ATACADO" && b.category !== "ATACADO") return -1;
      if (a.category !== "ATACADO" && b.category === "ATACADO") return 1;
      return a.name.localeCompare(b.name);
    });
    if (!q) return list;
    return list.filter((p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.stockCategoryName || "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const totalItems = useMemo(() => items.reduce((a, b) => a + b.subtotal, 0), [items]);
  const deliveryFee = parseFloat(formCustomer.deliveryFee || "0");
  const total = totalItems + (isNaN(deliveryFee) ? 0 : deliveryFee);
  const totalSacosUnitarios = useMemo(
    () => items.reduce((a, b) => a + b.quantity * b.sacosPerUnit, 0),
    [items]
  );

  // Ao selecionar um usuário: preenche tudo automaticamente
  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setUserSearch("");
    setShowUserDropdown(false);
    setFormCustomer((c) => ({
      ...c,
      name: u.businessName || u.name,
      phone: u.phone || "",
      email: u.email || "",
      cpfCnpj: u.cnpj || c.cpfCnpj,
      address: [u.address, u.city, u.state].filter(Boolean).join(", ") || c.address,
    }));
    // Resetar preços de itens porque mudou o tipo (lojista = preço atacado, cliente = preço normal)
    setItems((curr) => {
      return curr.map((i) => {
        const p = products.find((pp) => pp.id === i.productId);
        if (!p) return i;
        const novoPreco = u.isLojista
          ? (p.lojaPrice && Number(p.lojaPrice) > 0 ? Number(p.lojaPrice) : Number(p.price))
          : Number(p.price);
        return { ...i, unitPrice: novoPreco, subtotal: i.quantity * novoPreco };
      });
    });
  };

  // Limpar usuário selecionado
  const handleClearUser = () => {
    setSelectedUser(null);
    // não limpa os campos do formulário (o admin pode ter digitado manualmente antes)
  };

  // Adicionar produto ao pedido
  const handleAddProduct = (p: Product) => {
    const precoBase = selectedUser?.isLojista
      ? (p.lojaPrice && Number(p.lojaPrice) > 0 ? Number(p.lojaPrice) : Number(p.price))
      : Number(p.price);

    setItems((curr) => {
      const existente = curr.find((i) => i.productId === p.id);
      if (existente) {
        return curr.map((i) =>
          i.productId === p.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...curr,
        {
          productId: p.id,
          productName: p.name,
          quantity: 1,
          unitPrice: precoBase,
          subtotal: precoBase,
          sacosPerUnit: p.sacosPerUnit || 1,
          stockCategoryName: p.stockCategoryName,
        },
      ];
    });
  };

  const handleChangeQty = (pid: string, delta: number) => {
    setItems((curr) =>
      curr
        .map((i) =>
          i.productId === pid
            ? { ...i, quantity: Math.max(1, i.quantity + delta), subtotal: Math.max(1, i.quantity + delta) * i.unitPrice }
            : i
        )
    );
  };

  const handleChangePrice = (pid: string, newPriceStr: string) => {
    const price = parseFloat(newPriceStr.replace(",", "."));
    if (isNaN(price)) return;
    setItems((curr) =>
      curr.map((i) =>
        i.productId === pid ? { ...i, unitPrice: price, subtotal: i.quantity * price } : i
      )
    );
  };

  const handleRemoveItem = (pid: string) => {
    setItems((curr) => curr.filter((i) => i.productId !== pid));
  };

  // Criação do pedido
  const handleSubmit = async (andConfirm: boolean) => {
    setSubmitting(true);
    setToastMsg(null);
    try {
      if (!formCustomer.name || !formCustomer.phone) {
        setToastMsg({ type: "err", text: "Nome e telefone são obrigatórios." });
        setSubmitting(false);
        return;
      }
      if (items.length === 0) {
        setToastMsg({ type: "err", text: "Adicione pelo menos 1 produto ao pedido." });
        setSubmitting(false);
        return;
      }

      const payload: any = {
        userId: selectedUser?.id || null,
        customerName: formCustomer.name,
        customerPhone: formCustomer.phone,
        customerEmail: formCustomer.email || null,
        customerCpfCnpj: formCustomer.cpfCnpj || null,
        address: formCustomer.address || null,
        deliveryFee,
        needsInvoice: formCustomer.needsInvoice,
        note: formCustomer.note || null,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          category: products.find((p) => p.id === i.productId)?.category,
        })),
        createAndConfirm: andConfirm,
      };

      const res = await fetch("/api/admin/orders/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erro ao criar pedido");

      let details = `Pedido #${data.orderNumber} criado com sucesso! Total: ${formatCurrency(data.total)}.`;
      if (andConfirm && data.loyaltyApplied) {
        const ly = data.loyaltyApplied;
        if (ly.lojistaUpdated) {
          details += ` ✅ Lojista: ${ly.sacosContabilizados || 0} sacos contabilizados${ly.atingiuMeta ? " 🎁 atingiu meta! +" + (ly.sacosPremiados || 0) + " sacos grátis" : ""}.`;
        } else if (ly.pointsAdded > 0) {
          details += ` ✅ Cliente: +${ly.pointsAdded} pontos creditados.`;
        }
      }

      setToastMsg({ type: "ok", text: andConfirm ? "🎉 Pedido CRIADO e CONFIRMADO com sucesso!" : "✅ Pedido criado — aguardando confirmação.", details });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2500);
    } catch (e: any) {
      setToastMsg({ type: "err", text: "Erro ao criar pedido.", details: e?.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-8 zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 border-b bg-gradient-to-br from-[var(--zice-50)] via-white to-white flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[var(--zice-100)] text-[var(--zice-medium)]">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[var(--zice-dark)]">📝 Novo Pedido Manual (Lojista / WhatsApp)</h2>
              <p className="text-xs text-gray-500 mt-1">
                Crie o pedido direto no admin — sem precisar logar na conta do cliente/lojista. Escolha criar como pendente ou criar <strong>e já confirmar</strong> (baixa estoque + conta sacos/pontos automaticamente).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* Toast inline */}
        {toastMsg && (
          <div className={`mx-5 mt-4 p-4 rounded-2xl border-2 font-bold text-sm flex items-start gap-3 ${
            toastMsg.type === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {toastMsg.type === "ok" ? <Sparkles size={20} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />}
            <div>
              <p>{toastMsg.text}</p>
              {toastMsg.details && <p className="font-normal text-xs mt-1 opacity-90">{toastMsg.details}</p>}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ===== COLUNA ESQUERDA: Dados do cliente + Busca produtos */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1) Busca de Usuário/Lojista */}
              <div className="bg-gradient-to-br from-blue-50/40 to-white p-5 rounded-3xl border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    Passo 1 — Cliente / Lojista
                  </h3>
                  {selectedUser && (
                    <button
                      onClick={handleClearUser}
                      className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                    >
                      Desvincular usuário
                    </button>
                  )}
                </div>

                {!selectedUser ? (
                  <div className="relative">
                    <div className="flex items-center bg-white border-2 border-blue-200 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500">
                      <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />
                      <input
                        className="w-full py-3 bg-transparent outline-none text-sm font-semibold placeholder:text-gray-400"
                        placeholder="🔍 Busque por NOME, TELEFONE, EMPRESA ou CNPJ do lojista... (Lojistas aparecem primeiro)"
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setShowUserDropdown(true); }}
                        onFocus={() => setShowUserDropdown(true)}
                        onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
                      />
                    </div>
                    {showUserDropdown && (
                      <div className="absolute z-20 mt-2 bg-white w-full rounded-2xl border-2 shadow-xl max-h-80 overflow-y-auto">
                        {loadingCfg ? (
                          <div className="p-4 text-center text-sm text-gray-400 font-semibold">Carregando...</div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-400">
                            Nenhum usuário encontrado. Preencha os dados manualmente abaixo.
                          </div>
                        ) : (
                          filteredUsers.map((u) => (
                            <button
                              type="button"
                              key={u.id}
                              onMouseDown={() => handleSelectUser(u)}
                              className="w-full px-4 py-3 text-left border-b hover:bg-blue-50 transition-colors flex items-center gap-3"
                            >
                              <div className={`p-2 rounded-xl flex-shrink-0 ${u.isLojista ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                {u.isLojista ? <Store size={18} /> : <UserCheck size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-black text-sm truncate">{u.businessName || u.name}</p>
                                  {u.isLojista && (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase border border-purple-200">
                                      🏪 LOJISTA
                                    </span>
                                  )}
                                  {u.role === "ADMIN" && (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase border border-amber-200">
                                      👑 ADMIN
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-semibold truncate">
                                  📞 {u.phone || "(sem telefone)"}
                                  {u.address ? ` · 📍 ${u.city || u.address}` : ""}
                                </p>
                                {u.isLojista && (
                                  <p className="text-[11px] text-purple-700 font-bold mt-0.5">
                                    Progresso atual: {u.sacosComprados}{" / "}{u.weeklyTarget || 100} sacos{" · "}
                                    {u.sacosGratis > 0 && `🎁 ${u.sacosGratis} grátis`}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border-2 border-green-300 rounded-2xl p-4 flex items-center gap-3">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${selectedUser.isLojista ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                      {selectedUser.isLojista ? <Store size={24} /> : <UserCheck size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-lg text-[var(--zice-dark)] truncate">{selectedUser.businessName || selectedUser.name}</p>
                        {selectedUser.isLojista && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 uppercase border border-purple-200">
                            🏪 LOJISTA {selectedUser.weeklyTarget && `— Meta ${selectedUser.weeklyTarget} sacos/sem`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        📞 {selectedUser.phone || "(sem telefone)"}
                        {selectedUser.email ? ` · ✉️ ${selectedUser.email}` : ""}
                      </p>
                      {selectedUser.isLojista && (
                        <p className="text-[11px] text-purple-700 font-bold mt-0.5">
                          💡 Observação: preços serão usados <strong>Preço Lojista (atacado)</strong> automaticamente ao adicionar produtos.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Dados do Cliente (editable) */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Nome completo *</label>
                    <input
                      className="input-field mt-1"
                      placeholder="Nome / Razão Social"
                      value={formCustomer.name}
                      onChange={(e) => setFormCustomer({ ...formCustomer, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Telefone *</label>
                    <input
                      className="input-field mt-1"
                      placeholder="(49) 99999-0000"
                      value={formCustomer.phone}
                      onChange={(e) => setFormCustomer({ ...formCustomer, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Email</label>
                    <input
                      className="input-field mt-1"
                      placeholder="email@exemplo.com"
                      type="email"
                      value={formCustomer.email}
                      onChange={(e) => setFormCustomer({ ...formCustomer, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">CPF / CNPJ</label>
                    <input
                      className="input-field mt-1"
                      placeholder="CPF ou CNPJ (apenas se quiser Nota Fiscal)"
                      value={formCustomer.cpfCnpj}
                      onChange={(e) => setFormCustomer({ ...formCustomer, cpfCnpj: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Endereço de entrega</label>
                    <input
                      className="input-field mt-1"
                      placeholder="Rua, nº, Bairro, Cidade, UF"
                      value={formCustomer.address}
                      onChange={(e) => setFormCustomer({ ...formCustomer, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-1">
                      <Truck size={12} className="text-gray-500" /> Taxa de Entrega (R$)
                    </label>
                    <input
                      className="input-field mt-1"
                      placeholder="0,00"
                      type="number"
                      step="0.01"
                      value={formCustomer.deliveryFee}
                      onChange={(e) => setFormCustomer({ ...formCustomer, deliveryFee: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-3 px-3 py-3 bg-white border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors w-full">
                      <input
                        type="checkbox"
                        checked={formCustomer.needsInvoice}
                        onChange={(e) => setFormCustomer({ ...formCustomer, needsInvoice: e.target.checked })}
                        className="w-4 h-4 text-[var(--zice-medium)]"
                      />
                      <span className="text-sm font-bold text-gray-700">📄 Precisa de Nota Fiscal?</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Observações (opcional)</label>
                    <textarea
                      rows={2}
                      className="input-field mt-1"
                      placeholder="Ex: Entregar de manhã, cliente pagou no PIX na hora, etc."
                      value={formCustomer.note}
                      onChange={(e) => setFormCustomer({ ...formCustomer, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 2) Busca e seleção de produtos */}
              <div className="bg-gradient-to-br from-green-50/40 to-white p-5 rounded-3xl border border-green-100">
                <h3 className="font-black text-sm uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-green-600" />
                  Passo 2 — Adicionar Produtos (clique para adicionar)
                </h3>
                <div className="flex items-center bg-white border-2 border-green-200 rounded-2xl px-4 mb-3 focus-within:ring-2 focus-within:ring-green-300 focus-within:border-green-500">
                  <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    className="w-full py-3 bg-transparent outline-none text-sm font-semibold placeholder:text-gray-400"
                    placeholder="🔍 Buscar produto por nome ou categoria... (Atacado primeiro)"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-sm text-gray-400 bg-white rounded-2xl border border-dashed">
                      Nenhum produto encontrado. Verifique em Admin → Produtos.
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const preco = selectedUser?.isLojista
                        ? (p.lojaPrice && Number(p.lojaPrice) > 0 ? Number(p.lojaPrice) : Number(p.price))
                        : Number(p.price);
                      const temLojaPrice = p.lojaPrice && Number(p.lojaPrice) > 0;
                      const noCarrinho = items.find((i) => i.productId === p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleAddProduct(p)}
                          className="text-left p-3 bg-white border-2 border-gray-100 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all group flex items-center gap-3"
                        >
                          <div className={`p-2.5 rounded-xl flex-shrink-0 ${p.category === "ATACADO" ? "bg-purple-50 text-purple-600" : "bg-sky-50 text-sky-600"}`}>
                            {p.category === "ATACADO" ? <Store size={20} /> : <ShoppingBag size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-black text-sm text-[var(--zice-dark)] truncate">{p.name}</p>
                              {noCarrinho && (
                                <span className="text-[9px] font-black bg-green-500 text-white rounded-full px-1.5 py-0.5">
                                  ✓ x{noCarrinho.quantity}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${p.category === "ATACADO" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"}`}>
                                {p.category}
                              </span>
                              {temLojaPrice && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 uppercase">
                                  Lojista: {formatCurrency(Number(p.lojaPrice!))}
                                </span>
                              )}
                              {p.stockCategoryName && (
                                <span className="text-[10px] font-bold text-gray-500">
                                  ❄️ {p.stockCategoryName} ({p.stock} em estoque)
                                </span>
                              )}
                              {(p.sacosPerUnit || 1) > 1 && (
                                <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded uppercase">
                                  {(p.sacosPerUnit || 1)} sacos
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-auto">
                            <p className="text-base font-black text-green-700">{formatCurrency(preco)}</p>
                            <p className="text-[10px] text-gray-400 font-semibold group-hover:text-green-600 transition-colors">
                              clique para add
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ===== COLUNA DIREITA: Itens selecionados + Resumo + Botões */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white p-5 rounded-3xl border shadow-sm sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <BadgeDollarSign size={16} className="text-orange-500" />
                    Resumo do Pedido
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-gray-50 flex items-center justify-center mb-3 text-gray-300">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-500">Nenhum produto adicionado</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Clique nos produtos à esquerda para montar o pedido
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4 max-h-[340px] overflow-y-auto pr-1">
                    {items.map((i) => (
                      <div key={i.productId} className="p-3 bg-gray-50 rounded-2xl border hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-[var(--zice-dark)] truncate">{i.productName}</p>
                            {i.stockCategoryName && (
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                                ❄️ {i.stockCategoryName}
                                {i.sacosPerUnit > 1 && ` · Kit de ${i.sacosPerUnit} sacos unitários`}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(i.productId)}
                            className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5 flex items-center gap-1 bg-white rounded-xl border py-1 px-1">
                            <button type="button" onClick={() => handleChangeQty(i.productId, -1)}
                              className="w-8 h-8 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 font-black flex items-center justify-center"><Minus size={14} /></button>
                            <input
                              type="number"
                              className="w-full text-center text-sm font-black bg-transparent outline-none py-1 min-w-0"
                              value={i.quantity}
                              onChange={(e) => {
                                const n = Math.max(1, parseInt(e.target.value) || 1);
                                setItems((c) => c.map((x) => x.productId === i.productId ? { ...x, quantity: n, subtotal: n * x.unitPrice } : x));
                              }}
                            />
                            <button type="button" onClick={() => handleChangeQty(i.productId, +1)}
                              className="w-8 h-8 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 font-black flex items-center justify-center"><Plus size={14} /></button>
                          </div>
                          <div className="col-span-4">
                            <label className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Preço unit.</label>
                            <input
                              type="number"
                              step="0.01"
                              value={i.unitPrice.toFixed(2)}
                              onChange={(e) => handleChangePrice(i.productId, e.target.value)}
                              className="w-full text-right text-sm font-black bg-white border rounded-xl px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-300 min-w-0"
                            />
                          </div>
                          <div className="col-span-3 text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subtotal</p>
                            <p className="text-base font-black text-blue-700">{formatCurrency(i.subtotal)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rodapé financeiro */}
                <div className="border-t pt-4 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-500">Subtotal dos itens</span>
                    <span className="font-bold text-[var(--zice-dark)]">{formatCurrency(totalItems)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                      <Truck size={14} /> Entrega
                    </span>
                    <span className="font-bold text-[var(--zice-dark)]">{formatCurrency(deliveryFee || 0)}</span>
                  </div>
                  {totalSacosUnitarios > 0 && (
                    <div className="flex justify-between items-center text-sm py-2 px-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="font-bold text-purple-700 flex items-center gap-1.5">
                        🧊 Total de SACOS UNITÁRIOS do pedido
                      </span>
                      <span className="text-lg font-black text-purple-700">{totalSacosUnitarios.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2 mt-2 border-t-2 border-dashed">
                    <span className="text-sm font-black uppercase tracking-wider text-gray-700">Total do Pedido</span>
                    <span className="text-3xl font-black text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Botões finais */}
                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    disabled={submitting || items.length === 0}
                    onClick={() => handleSubmit(false)}
                    className="w-full py-4 px-5 rounded-2xl font-black text-sm uppercase bg-white border-2 border-[var(--zice-medium)] text-[var(--zice-medium)] hover:bg-[var(--zice-50)] transition-all disabled:opacity-40 disabled:cursor-not-allowed tracking-wider flex items-center justify-center gap-2"
                  >
                    <UserCheck size={18} />
                    Criar Pedido Pendente (eu confirmo depois)
                  </button>
                  <button
                    type="button"
                    disabled={submitting || items.length === 0}
                    onClick={() => handleSubmit(true)}
                    className="w-full py-4 px-5 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-green-600 via-[var(--zice-medium)] to-blue-600 text-white hover:brightness-110 shadow-lg hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed tracking-wider flex items-center justify-center gap-2 animate-in"
                  >
                    <Rocket size={20} />
                    🚀 CRIAR E JÁ CONFIRMAR (baixa estoque + sacos/pontos agora!)
                  </button>
                  <p className="text-[11px] text-center text-gray-500 font-semibold pt-1">
                    A opção verde-roxo executa tudo de uma vez: baixa estoque, conta sacos para lojista ou pontos para cliente, gera Nota Fiscal se precisar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
