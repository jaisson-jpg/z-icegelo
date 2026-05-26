"use client";

import { useCart } from "@/components/CartProvider";
import { formatCurrency, cn, maskPhone, maskCpfCnpj } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Copy, Check, Upload, Truck, Bike, Info } from "lucide-react";
import { NEIGHBORHOODS, calculateDeliveryFee } from "@/lib/delivery";

type PixConfig = {
  pixKey: string;
  pixType: string;
  pixHolder: string;
};

function CheckoutContent() {
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
    neighborhood: "",
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

  const copyPix = () => {
    if (pix?.pixKey) {
      navigator.clipboard.writeText(pix.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const finalTotal = Number(total) || 0;

  const handleSubmit = async (e: React.FormEvent, isDirectPix: boolean = false) => {
    e.preventDefault();
    
    if (isDirectPix && !receipt) {
      alert("Por favor, anexe o comprovante do PIX para finalizar o pagamento.");
      return;
    }

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
      fd.append("total", String(finalTotal));
      fd.append("deliveryFee", "0");
      if (receipt) fd.append("receipt", receipt);

      const res = await fetch("/api/orders", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar pedido");

      setOrderId(data.orderId);
      
      // Preparar mensagem para WhatsApp
      const itemsList = items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');
      let message = "";
      
      if (isDirectPix) {
        message = `✅ *PEDIDO COM PIX REALIZADO*\n\n*Nº do Pedido:* ${data.orderId}\n*Cliente:* ${form.customerName}\n*Endereço:* ${form.address}\n\n*Produtos:*\n${itemsList}\n\n*Total:* ${formatCurrency(finalTotal)}\n\n_Já enviei o comprovante pelo site, mas estou mandando aqui também!_`;
      } else {
        message = `❓ *CONSULTA DE FRETE*\n\n*Nº do Pedido:* ${data.orderId}\n*Cliente:* ${form.customerName}\n*Endereço:* ${form.address}\n\n*Produtos:*\n${itemsList}\n\n*Total:* ${formatCurrency(finalTotal)}\n\n_Pode me passar o valor do frete para eu finalizar o pagamento?_`;
      }
      
      const whatsappUrl = `https://wa.me/5547996471803?text=${encodeURIComponent(message)}`;
      
      if (data.linkedToAccount) {
        sessionStorage.setItem("zice_last_order_linked", "1");
      }
      clearCart();

      // Abrir WhatsApp em nova aba
      window.open(whatsappUrl, '_blank');

    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar pedido");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex justify-between text-sm py-1 text-[var(--zice-medium)] font-bold italic bg-[var(--zice-ice)] p-2 rounded-lg mt-2">
          <span className="flex items-center gap-2">
            <Truck size={14} />
            Frete de Entrega
          </span>
          <span>A COMBINAR</span>
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
          <span>Total (Produtos)</span>
          <span className="text-[var(--zice-medium)]">{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      {pix && (
        <div className="bg-[var(--zice-ice)] p-5 rounded-2xl border-2 border-dashed border-[var(--zice-medium)] text-center space-y-4 mb-8">
          <div>
            <p className="text-[10px] font-black text-[var(--zice-medium)] uppercase tracking-widest mb-1">
              Tipo de Chave: {pix.pixType}
            </p>
            <p className="text-xl sm:text-2xl font-black text-[var(--zice-dark)] break-all select-all">
              {pix.pixKey}
            </p>
          </div>
          
          <div className="pt-2 border-t border-blue-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Beneficiário</p>
            <p className="font-bold text-[var(--zice-dark)] uppercase">{pix.pixHolder}</p>
          </div>

          <button
            type="button"
            onClick={copyPix}
            className="w-full py-3 bg-white text-[var(--zice-medium)] rounded-xl text-xs font-black border-2 border-[var(--zice-medium)] hover:bg-[var(--zice-ice)] transition-all"
          >
            {copied ? "✅ COPIADO!" : "📋 COPIAR CHAVE PIX"}
          </button>
          <p className="text-xs text-gray-500">
            Faça o PIX do valor total e envie o comprovante abaixo.
          </p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
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
            onChange={(e) => setForm({ ...form, customerPhone: maskPhone(e.target.value) })}
            maxLength={15}
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
          <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-800 uppercase">Como funciona o frete?</p>
            <p className="text-xs text-blue-600">
              Você pode enviar o pedido agora para **combinar o frete** via WhatsApp, ou se já souber o valor, pode fazer o **PIX direto** e anexar o comprovante.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço de Entrega (Rua, Nº, Bairro e Cidade) *</label>
          <textarea
            className="input-field min-h-[80px]"
            required
            placeholder="Ex: Rua João da Silva, 123 - Bairro Centro, Guaramirim"
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
              onChange={(e) => setForm({ ...form, customerCpfCnpj: maskCpfCnpj(e.target.value) })}
              maxLength={18}
            />
          </div>
        )}
        
        <div className="pt-4 space-y-6">
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, false)}
            disabled={loading}
            className={cn("btn-outline w-full py-4 text-lg border-2", loading && "btn-loading")}
          >
            {loading ? "" : "Enviar Pedido para saber o frete"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">OU SE JÁ FEZ O PIX</span></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--zice-dark)] mb-2">
                Anexar Comprovante PIX (Obrigatório para o botão abaixo)
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-[var(--zice-medium)] rounded-xl p-6 cursor-pointer hover:bg-[var(--zice-ice)]">
                <Upload className="text-[var(--zice-medium)]" />
                <span className="text-sm">
                  {receipt ? receipt.name : "Clique para enviar o comprovante"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className={cn("btn-primary w-full py-4 text-lg shadow-xl", loading && "btn-loading")}
            >
              {loading ? "" : "Já fiz o PIX — Enviar com Comprovante"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-gray-500">Carregando checkout...</div>
      </div>
    );
  }

  return <CheckoutContent />;
}
