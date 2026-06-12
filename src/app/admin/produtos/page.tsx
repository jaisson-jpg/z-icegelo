import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { orderItems: true } }, stockCategory: true },
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)]">Produtos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Cadastre e edite os produtos que aparecem na loja (varejo e atacado)
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="btn-primary text-sm">
          ➕ Novo produto
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--zice-ice)]">
              <tr>
                <th className="text-left p-3">Ordem</th>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Categoria</th>
              <th className="text-right p-3">Preço</th>
              <th className="text-right p-3">Estoque</th>
              <th className="text-right p-3">Pontos</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={`border-t ${!p.active ? "opacity-50 bg-gray-50" : ""}`}>
                  <td className="p-3 text-gray-500">{p.sortOrder}</td>
                  <td className="p-3">
                    <p className="font-medium">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</p>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.category === "ATACADO"
                          ? "bg-[var(--zice-dark)] text-white"
                          : "bg-[var(--zice-light)] text-[var(--zice-dark)]"
                      }`}
                    >
                      {p.category === "ATACADO" ? "Atacado" : "Varejo"}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatCurrency(p.price)}
                    <span className="text-xs text-gray-400 font-normal"> /{p.unit}</span>
                  </td>
                  <td className={`p-3 text-right font-bold ${(p.stockCategory ? p.stockCategory.quantity : p.stock) <= 0 ? "text-red-600" : (p.stockCategory ? p.stockCategory.quantity : p.stock) <= 10 ? "text-yellow-600" : ""}`}>
                    {p.stockCategory ? (
                      <div className="flex flex-col items-end">
                        <span>{p.stockCategory.quantity}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{p.stockCategory.name}</span>
                      </div>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="p-3 text-right">{p.pointsEarn}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {p.active ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full uppercase">
                          Inativo
                        </span>
                      )}
                      {p.isComingSoon && (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                          Em Breve
                        </span>
                      )}
                      {(p.stockCategory ? p.stockCategory.quantity : p.stock) <= 0 && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase">
                          Esgotado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="p-2 text-[var(--zice-medium)] hover:bg-[var(--zice-ice)] rounded-lg"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <DeleteProductButton
                        id={p.id}
                        name={p.name}
                        hasOrders={p._count.orderItems > 0}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            Nenhum produto cadastrado.{" "}
            <Link href="/admin/produtos/novo" className="text-[var(--zice-medium)] font-semibold hover:underline">
              Cadastrar o primeiro
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
