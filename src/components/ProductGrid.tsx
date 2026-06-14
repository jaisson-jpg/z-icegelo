"use client";

import Image from "next/image";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  lojaPrice: number | null;
  unit: string;
  category: "VAREJO" | "ATACADO";
  pointsEarn: number;
  stock: number;
  isComingSoon: boolean;
  imageUrl: string | null;
};

export function ProductGrid({ products, userRole }: { products: Product[], userRole?: "ADMIN" | "CUSTOMER" | "LOJISTA" | null }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  const getProductPrice = (p: Product) => {
    if (userRole === "LOJISTA" && p.lojaPrice !== null) {
      return p.lojaPrice;
    }
    return p.price;
  };

  const handleAdd = (p: Product) => {
    if (p.isComingSoon) {
      alert("Este produto estará disponível em breve!");
      return;
    }
    if (p.stock <= 0) {
      alert("Produto sem estoque no momento.");
      return;
    }
    addItem({
      productId: p.id,
      name: p.name,
      price: getProductPrice(p),
      category: p.category,
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {products.map((p) => (
        <article key={p.id} className="ice-card rounded-2xl p-4 sm:p-6 flex flex-col relative overflow-hidden">
          {p.isComingSoon && (
            <div className="absolute top-4 -right-12 bg-orange-500 text-white text-[10px] font-bold py-1 px-12 rotate-45 shadow-md z-10 uppercase tracking-wider">
              Em breve
            </div>
          )}
          {p.stock <= 0 && !p.isComingSoon && (
            <div className="absolute top-4 -right-12 bg-red-600 text-white text-[10px] font-bold py-1 px-12 rotate-45 shadow-md z-10 uppercase tracking-wider">
              Esgotado
            </div>
          )}
          
          <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-[var(--zice-ice)] relative">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                className={cn("object-cover", (p.stock <= 0 || p.isComingSoon) && "grayscale opacity-60")}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full ice-gradient flex items-center justify-center text-5xl">
                🧊
              </div>
            )}
          </div>
          <h3 className="font-bold text-[var(--zice-dark)] text-base sm:text-lg">{p.name}</h3>
          {p.description && (
            <p className="text-sm text-gray-600 mt-2 flex-1 line-clamp-3">{p.description}</p>
          )}
          <p className={`text-xs mt-2 font-medium ${p.isComingSoon ? "text-orange-600" : p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {p.isComingSoon ? "Disponível em breve" : p.stock > 0 ? `${p.stock} em estoque` : "Sem estoque no momento"}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3">
            <div>
              {userRole === "LOJISTA" && p.lojaPrice !== null ? (
                <>
                  <p className="text-sm text-gray-400 line-through">
                    {formatCurrency(p.price)}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--zice-medium)]">
                    {formatCurrency(p.lojaPrice)}
                  </p>
                </>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-[var(--zice-medium)]">
                  {formatCurrency(p.price)}
                </p>
              )}
              <p className="text-xs text-gray-500">/{p.unit}</p>
              <p className="text-xs text-[var(--zice-dark)] mt-1">+{p.pointsEarn} pontos</p>
            </div>
            <button
              onClick={() => handleAdd(p)}
              disabled={p.stock <= 0 || p.isComingSoon}
              className={cn(
                "btn-primary py-2 px-4 text-sm justify-center disabled:opacity-50",
                p.isComingSoon && "bg-orange-500",
                p.stock <= 0 && !p.isComingSoon && "bg-gray-400"
              )}
            >
              {p.isComingSoon ? "Em breve" : p.stock <= 0 ? "Esgotado" : added === p.id ? "Adicionado!" : (
                <>
                  <Plus size={16} />
                  <ShoppingCart size={16} />
                </>
              )}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
