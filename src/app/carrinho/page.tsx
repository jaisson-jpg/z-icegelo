"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-[var(--zice-dark)] mb-4">
          Carrinho vazio
        </p>
        <Link href="/loja" className="btn-primary">
          Ir para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--zice-dark)] mb-8">Carrinho</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="ice-card rounded-xl p-4 flex gap-4 items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--zice-dark)]">{item.name}</h3>
              <p className="text-[var(--zice-medium)] font-bold">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="p-2 rounded-lg bg-[var(--zice-light)] text-[var(--zice-dark)]"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="p-2 rounded-lg bg-[var(--zice-light)] text-[var(--zice-dark)]"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="ice-card rounded-xl p-6 mt-8">
        <div className="flex justify-between text-xl font-bold text-[var(--zice-dark)] mb-6">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full text-lg">
          Finalizar com PIX
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
