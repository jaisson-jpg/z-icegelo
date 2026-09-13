"use client";

import { useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { ManualOrderModal } from "./ManualOrderModal";
import { useRouter } from "next/navigation";

export function ManualOrderButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-2xl transition-shadow"
      >
        <Plus size={18} />
        <ShoppingBag size={18} />
        PEDIDO MANUAL / WHATSAPP
      </button>

      <ManualOrderModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
