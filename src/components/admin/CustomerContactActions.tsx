"use client";

import { useState } from "react";
import { MessageCircle, Mail, Send, X } from "lucide-react";

type ContactActionsProps = {
  name: string;
  phone: string | null;
  email: string;
};

export function CustomerContactActions({ name, phone, email }: ContactActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [template, setTemplate] = useState("reminder");

  const templates = {
    reminder: {
      label: "Lembrete de Compra",
      text: `Olá ${name}, tudo bem? Sentimos sua falta aqui na Z-ice Gelo! 🧊 Precisando de gelo puro e cristalino para seu estoque ou evento? Faz seu pedido pelo site ou me chama aqui!`,
    },
    promotion: {
      label: "Promoção Especial",
      text: `Oi ${name}! Temos uma oferta especial para você hoje na Z-ice. 🧊 Confira os preços no nosso site e aproveite!`,
    },
    feedback: {
      label: "Pedido de Feedback",
      text: `Olá ${name}, como foi sua última experiência com a Z-ice? Sua opinião é muito importante para nós! 🧊`,
    },
  };

  const handleWhatsApp = () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const text = encodeURIComponent(templates[template as keyof typeof templates].text);
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, "_blank");
    setIsOpen(false);
  };

  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent("Z-ice Gelo - Temos novidades para você!")}&body=${encodeURIComponent(templates[template as keyof typeof templates].text)}`;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded-lg text-xs font-bold transition-colors"
        >
          <MessageCircle size={14} /> CONTATO RÁPIDO
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-[var(--zice-ice)] flex items-center justify-between border-b">
              <div>
                <h3 className="text-xl font-bold text-[var(--zice-dark)]">Contatar {name.split(" ")[0]}</h3>
                <p className="text-xs text-blue-600 font-bold uppercase">Escolha uma mensagem padrão</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {Object.entries(templates).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setTemplate(key)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      template === key
                        ? "border-[var(--zice-medium)] bg-blue-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <p className={`font-bold text-sm ${template === key ? "text-[var(--zice-dark)]" : "text-gray-500"}`}>
                      {value.label}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{value.text}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Prévia da mensagem:</p>
                <p className="text-sm text-gray-600 italic">"{templates[template as keyof typeof templates].text}"</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex flex-col gap-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWhatsApp}
                  disabled={!phone}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-green-100 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <a
                  href={mailtoUrl}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all text-center"
                >
                  <Mail size={18} /> E-mail
                </a>
              </div>
              {!phone && <p className="text-[10px] text-red-500 text-center font-bold uppercase">Telefone não cadastrado para este cliente</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
