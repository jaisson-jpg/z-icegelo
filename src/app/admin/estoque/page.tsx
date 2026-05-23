import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Package, AlertTriangle } from "lucide-react";

export default async function EstoquePage() {
  const products = await prisma.product.findMany({
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStock = products.filter((p) => p.stock <= 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-2">Estoque</h1>
      <p className="text-sm text-gray-600 mb-6">
        O estoque baixa automaticamente ao confirmar um pedido. Edite em Produtos.
      </p>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {outOfStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-800 flex items-center gap-2">
                <AlertTriangle size={18} /> Sem estoque ({outOfStock.length})
              </p>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="font-semibold text-yellow-800 flex items-center gap-2">
                <AlertTriangle size={18} /> Estoque baixo ({lowStock.length})
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-[var(--zice-ice)]">
            <tr>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-right p-3">Preço</th>
              <th className="text-right p-3">Estoque</th>
              <th className="text-center p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.category === "ATACADO" ? "Atacado" : "Varejo"}</td>
                <td className="p-3 text-right">{formatCurrency(p.price)}</td>
                <td className="p-3 text-right font-bold">{p.stock}</td>
                <td className="p-3 text-center">
                  {p.stock <= 0 ? (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Zerado</span>
                  ) : p.stock <= 10 ? (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Baixo</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">OK</span>
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/admin/produtos/${p.id}`} className="text-[var(--zice-medium)] text-xs font-semibold hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/admin/produtos" className="btn-primary mt-6 inline-flex items-center gap-2">
        <Package size={18} /> Gerenciar produtos
      </Link>
    </div>
  );
}
