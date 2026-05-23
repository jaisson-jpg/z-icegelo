"use client";

import { Printer, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function InvoicePrintBar({ orderId }: { orderId: string }) {
  return (
    <div className="print:hidden sticky top-0 z-50 bg-[var(--zice-dark)] text-white p-3 flex flex-wrap gap-2 justify-center items-center">
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-white/20"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-white text-[var(--zice-dark)] font-semibold"
      >
        <Printer size={16} /> Imprimir / Salvar PDF
      </button>
      <button
        type="button"
        onClick={async () => {
          if (navigator.share) {
            await navigator.share({
              title: "Nota Fiscal Z-ice",
              url: window.location.href,
            });
          } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link copiado!");
          }
        }}
        className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-white/20"
      >
        <Share2 size={16} /> Compartilhar
      </button>
    </div>
  );
}
