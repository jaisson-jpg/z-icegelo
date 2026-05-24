import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Users, Search, Phone, MapPin, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  noStore();
  const query = searchParams.q || "";

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--zice-dark)]">Base de Clientes</h1>
          <p className="text-sm text-gray-600">Visualize e busque por todos os clientes cadastrados</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border flex items-center gap-2">
          <Users className="text-[var(--zice-medium)]" size={20} />
          <span className="font-bold text-lg">{customers.length}</span>
          <span className="text-sm text-gray-500">total</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nome, e-mail, telefone ou cidade..."
            className="input-field pl-10 w-full"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h3 className="font-bold text-[var(--zice-dark)] truncate text-lg">{c.name}</h3>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
              </div>
              <div className="bg-[var(--zice-ice)] text-[var(--zice-dark)] text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                {c._count.orders} PEDIDOS
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="shrink-0 text-[var(--zice-medium)]" />
                <span>{c.phone || "Não informado"}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="shrink-0 mt-0.5 text-[var(--zice-medium)]" />
                <span className="leading-tight">
                  {c.address ? `${c.address}${c.number ? `, ${c.number}` : ""}` : "Endereço não informado"}
                  <br />
                  <span className="text-xs font-semibold">{c.city || "Cidade não informada"}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Calendar size={12} />
                <span>Cadastrado em: {new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t">
              <span className="text-xs font-bold text-gray-400 uppercase">Fidelidade</span>
              <span className="text-[var(--zice-medium)] font-bold">{c.points} pontos</span>
            </div>
          </div>
        ))}

        {customers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
            <Users className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500 font-medium">Nenhum cliente encontrado para sua busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
