"use client";

import { Printer, Share2, FileText } from "lucide-react";

export function InvoiceActions({ orderId }: { orderId: string }) {
  const url = `/admin/pedidos/${orderId}/nota-fiscal`;

  const handlePrint = () => {
    window.open(url, "_blank")?.print();
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${url}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nota Fiscal Z-ice Gelo",
          text: "Nota fiscal do pedido",
          url: fullUrl,
        });
      } catch {
        window.open(url, "_blank");
      }
    } else {
      navigator.clipboard.writeText(fullUrl);
      alert("Link copiado!");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-[var(--zice-ice)] text-[var(--zice-dark)] font-medium hover:bg-[var(--zice-light)]"
      >
        <FileText size={16} /> Ver NF
      </a>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-[var(--zice-medium)] text-[var(--zice-dark)] font-medium"
      >
        <Printer size={16} /> Imprimir
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-[var(--zice-medium)] text-[var(--zice-dark)] font-medium"
      >
        <Share2 size={16} /> Compartilhar
      </button>
    </div>
  );
}
