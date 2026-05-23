import { ProductForm } from "@/components/admin/ProductForm";

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-2">Novo produto</h1>
      <p className="text-sm text-gray-600 mb-6">
        O produto aparecerá na loja assim que estiver marcado como ativo.
      </p>
      <ProductForm />
    </div>
  );
}
