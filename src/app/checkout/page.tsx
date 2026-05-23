"use client";

import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Check, Upload } from "lucide-react";

type PixConfig = {
  pixKey: string;
  pixHolder: string;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [pix, setPix] = useState<PixConfig | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    customerCpfCnpj: "",
    needsInvoice: false,
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setPix)
      .catch(() => setPix({ pixKey: "47996471803", pixHolder: "Z-ice Gelo" }));
  }, []);

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.checkoutDefaults) {
          setForm((prev) => ({
            ...prev,
            customerName: data.checkoutDefaults.customerName || prev.customerName,
            customerPhone: data.checkoutDefaults.customerPhone || prev.customerPhone,
            customerEmail: data.checkoutDefaults.customerEmail || prev.customerEmail,
            address: data.checkoutDefaults.address || prev.address,
            customerCpfCnpj: data.checkoutDefaults.customerCpfCnpj || prev.customerCpfCnpj,
            needsInvoice: data.checkoutDefaults.needsInvoice ?? prev.needsInvoice,
          }));
          setUserRole(data.role);
        }
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, []);

  if (!profileLoaded) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-gray-500">Carregando checkout...</div>
      </div>
    );
  }

  if (!userRole && !orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="ice-card rounded-2xl p-8 border-2 border-[var(--zice-light)]">
          <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-4">
            Identificação Necessária
          </h1>
          <p className="text-gray-600 mb-8">
            Para finalizar sua compra e garantir seus pontos de fidelidade, você precisa estar logado em sua conta.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/login?redirect=/checkout`} className="btn-primary">
              Entrar na minha conta
            </Link>
            <Link href={`/cadastro?redirect=/checkout`} className="btn-outline">
              Criar uma conta nova
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold mb-4">Carrinho vazio</p>
        <Link href="/loja" className="btn-primary">Voltar à loja</Link>
      </div>
    );
  }

  const copyPix = () => {
    if (pix?.pixKey) {
      navigator.clipboard.writeText(pix.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("customerName", form.customerName);
      fd.append("customerPhone", form.customerPhone);
      fd.append("customerEmail", form.customerEmail);
      fd.append("address", form.address);
      fd.append("customerCpfCnpj", form.customerCpfCnpj);
      fd.append("needsInvoice", String(form.needsInvoice));
      fd.append("items", JSON.stringify(items));
      fd.append("total", String(total));
      if (receipt) fd.append("receipt", receipt);

      const res = await fetch("/api/orders", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar pedido");

      setOrderId(data.orderId);
      if (data.linkedToAccount) {
        sessionStorage.setItem("zice_last_order_linked", "1");
      }
      clearCart();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar pedido");
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="ice-card rounded-2xl p-8">
          <Check className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-4">
            Pedido enviado!
          </h1>
          <p className="text-gray-600 mb-6">
            Recebemos seu pedido e comprovante PIX. Assim que confirmarmos o pagamento,
            você ganhará seus pontos Z-ice e entraremos em contato para a entrega.
          </p>
          <p className="text-sm text-gray-500 mb-6">Nº do pedido: <strong>{orderId}</strong></p>
          <div className="flex flex-col gap-3">
            <Link
              href={userRole === "LOJISTA" ? "/lojista" : "/minha-conta"}
              className="btn-primary"
            >
              {userRole === "LOJISTA" ? "Ver meu progresso" : "Minha conta"}
            </Link>
            <Link href="/" className="btn-outline">Voltar ao início</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--zice-dark)] mb-8">Checkout — PIX</h1>

      <div className="ice-card rounded-xl p-6 mb-8">
        <h2 className="font-bold text-[var(--zice-dark)] mb-4">Resumo</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm py-1">
            <span>{i.name} x{i.quantity}</span>
            <span>{formatCurrency(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-[var(--zice-medium)]">{formatCurrency(total)}</span>
        </div>
      </div>

      {pix && (
        <div className="ice-card rounded-xl p-6 mb-8 bg-[var(--zice-ice)]">
          <h2 className="font-bold text-[var(--zice-dark)] mb-3">Dados PIX</h2>
          <p className="text-sm text-gray-600 mb-2">Titular: {pix.pixHolder}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white p-3 rounded-lg text-sm break-all border">
              {pix.pixKey}
            </code>
            <button type="button" onClick={copyPix} className="btn-primary py-3 px-4">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Faça o PIX do valor total e envie o comprovante abaixo.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {profileLoaded && userRole && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
            ✓ Dados preenchidos automaticamente da sua conta
            {userRole === "LOJISTA" && " (lojista)"}
          </div>
        )}
        {!profileLoaded && (
          <p className="text-xs text-gray-500">
            <Link href="/login" className="text-[var(--zice-medium)] font-semibold hover:underline">
              Entre na sua conta
            </Link>{" "}
            para preencher os dados automaticamente
          </p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            {userRole === "LOJISTA" ? "Nome do estabelecimento *" : "Nome completo *"}
          </label>
          <input
            className="input-field"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp / Telefone *</label>
          <input
            className="input-field"
            required
            placeholder="(47) 99999-9999"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail (opcional)</label>
          <input
            type="email"
            className="input-field"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Endereço de entrega</label>
          <textarea
            className="input-field min-h-[80px]"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-[var(--zice-light)] cursor-pointer">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.needsInvoice}
            onChange={(e) => setForm({ ...form, needsInvoice: e.target.checked })}
          />
          <span className="text-sm">
            <strong>Preciso de Nota Fiscal</strong>
            <br />
            <span className="text-gray-500">Marque para emitir NF após confirmação do pagamento</span>
          </span>
        </label>
        {form.needsInvoice && (
          <div>
            <label className="block text-sm font-medium mb-1">CPF ou CNPJ *</label>
            <input
              className="input-field"
              required={form.needsInvoice}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={form.customerCpfCnpj}
              onChange={(e) => setForm({ ...form, customerCpfCnpj: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            Comprovante PIX (imagem) *
          </label>
          <label className="flex items-center gap-3 border-2 border-dashed border-[var(--zice-medium)] rounded-xl p-6 cursor-pointer hover:bg-[var(--zice-ice)]">
            <Upload className="text-[var(--zice-medium)]" />
            <span className="text-sm">
              {receipt ? receipt.name : "Clique para enviar o comprovante"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              required
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
          {loading ? "Enviando..." : "Enviar pedido"}
        </button>
      </form>
    </div>
  );
}
