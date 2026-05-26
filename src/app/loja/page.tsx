import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/ProductGrid";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export const revalidate = 60;

export default async function LojaPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const varejo = products
    .filter((p) => p.category === "VAREJO")
    .map((p) => ({
      ...p,
      price: Number(p.price),
      category: p.category as "VAREJO" | "ATACADO",
      isComingSoon: !!p.isComingSoon,
    }));

  const atacado = products
    .filter((p) => p.category === "ATACADO")
    .map((p) => ({
      ...p,
      price: Number(p.price),
      category: p.category as "VAREJO" | "ATACADO",
      isComingSoon: !!p.isComingSoon,
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[var(--zice-dark)]">Loja Z-ice</h1>
          <p className="text-gray-600 mt-1">
            Escolha seus produtos e finalize com PIX
          </p>
        </div>
        <Link href="/carrinho" className="btn-primary">
          <ShoppingCart size={20} />
          Ver carrinho
        </Link>
      </div>

      {varejo.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--zice-medium)] mb-6 border-b-2 border-[var(--zice-light)] pb-2">
            Varejo
          </h2>
          <ProductGrid products={varejo} />
        </section>
      )}

      {atacado.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[var(--zice-medium)] mb-6 border-b-2 border-[var(--zice-light)] pb-2">
            Atacado
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Para mercados, padarias e comércios. Cadastre-se como lojista para acompanhar sacos grátis.
          </p>
          <ProductGrid products={atacado} />
        </section>
      )}
    </div>
  );
}
