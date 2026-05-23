import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/produtos"
          className="text-sm text-[var(--zice-medium)] hover:underline"
        >
          ← Voltar para produtos
        </Link>
        <h1 className="text-2xl font-bold text-[var(--zice-dark)] mt-2">Editar produto</h1>
        <p className="text-gray-600">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
