"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ phone = "5547996471803" }: { phone?: string }) {
  const message = encodeURIComponent(
    "Olá! Vim pelo site da Z-ice Gelo e gostaria de mais informações."
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-4 rounded-full shadow-2xl font-semibold transition transform hover:scale-105"
      aria-label="WhatsApp Z-ice Gelo"
    >
      <MessageCircle size={24} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
