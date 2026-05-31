import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ConfirmOrderButton } from "@/components/admin/ConfirmOrderButton";
import { InvoiceActions } from "@/components/InvoiceActions";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentStatus = params.status || "ALL";
  const page = Math.max(1, parseInt(params.page || "1"));
  const pageSize = 20;

  const where: any = {};
  if (currentStatus === "PENDING") {
    where.status = { in: ["PENDING_PIX", "AWAITING_CONFIRMATION"] };
  } else if (currentStatus !== "ALL") {
    where.status = currentStatus;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: { include: { product: true } },
        user: { include: { lojista: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const statusFilters = [
    { label: "Todos", value: "ALL" },
    { label: "Pendentes", value: "PENDING" },
    { label: "Confirmados", value: "CONFIRMED" },
    { label: "Cancelados", value: "CANCELLED" },
  ];

  const statusLabels: Record<string, string> = {
    PENDING_PIX: "Aguardando PIX",
    AWAITING_CONFIRMATION: "Aguardando confirmação",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
  };

  const statusColors: Record<string, string> = {
    PENDING_PIX: "bg-yellow-100 text-yellow-800",
    AWAITING_CONFIRMATION: "bg-orange-100 text-orange-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--zice-dark)]">Gerenciamento de Pedidos</h1>
          <p className="text-gray-500">Mostrando {orders.length} de {total} pedidos</p>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={`/admin/pedidos?status=${f.value}`}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              currentStatus === f.value
                ? "bg-[var(--zice-medium)] text-white border-[var(--zice-medium)] shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => {
          const lojista = order.user?.lojista;
          return (
            <div key={order.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Header do Card */}
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    order.status === "AWAITING_CONFIRMATION" ? "bg-orange-500" : 
                    order.status === "PENDING_PIX" ? "bg-yellow-500" : "hidden"
                  }`} />
                  <span className="font-mono font-bold text-lg text-[var(--zice-dark)]">{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-400 mt-1">
                    {order.createdAt.toISOString().split('T')[0].split('-').reverse().join('/')}
                  </p>
                  <DeleteOrderButton orderId={order.id} />
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna 1: Cliente e Endereço */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Cliente</h3>
                    <p className="font-bold text-[var(--zice-dark)]">{order.customerName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span>📞</span> {order.customerPhone}
                    </p>
                    {order.customerEmail && <p className="text-xs text-gray-400 mt-1">{order.customerEmail}</p>}
                  </div>
                  
                  {order.address && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Endereço de Entrega</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {order.address}
                      </p>
                    </div>
                  )}

                  {lojista && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Perfil Lojista</p>
                      <p className="text-sm font-bold text-blue-700">🏪 {lojista.businessName}</p>
                    </div>
                  )}
                </div>

                {/* Coluna 2: Itens e Total */}
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resumo do Pedido</h3>
                  <div className="space-y-2">
                    {order.items?.map((i) => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          {i.quantity}x {i.product?.name || "Produto Indisponível"}
                        </span>
                        <span className="font-bold text-[var(--zice-dark)]">{formatCurrency(i.subtotal || 0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase">Produtos: {formatCurrency(Number(order.total) - (Number(order.deliveryFee) || 0))}</span>
                      <span className="text-xs font-bold text-blue-400 uppercase">Frete: {formatCurrency(Number(order.deliveryFee) || 0)}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase mt-1">Total Geral</span>
                    </div>
                    <span className="text-2xl font-black text-[var(--zice-medium)]">{formatCurrency(Number(order.total))}</span>
                  </div>
                </div>

                {/* Coluna 3: Ações e Comprovante */}
                <div className="space-y-6">
                  {order.pixReceiptUrl && (
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest text-center lg:text-left">Comprovante PIX</h3>
                      <div className="flex flex-col items-center lg:items-start gap-3">
                        <a 
                          href={order.pixReceiptUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block group relative"
                        >
                          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-2 border-gray-200 overflow-hidden bg-white shadow-sm group-hover:border-[var(--zice-medium)] transition-all">
                            {/* Substituído Next/Image por img padrão para evitar exceções client-side */}
                            <img
                              src={order.pixReceiptUrl}
                              alt="Comprovante"
                              className="w-full h-full object-contain p-2"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <div className="bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                              Ver Grande
                            </div>
                          </div>
                        </div>
                      </a>
                      <a 
                        href={order.pixReceiptUrl} 
                        download={`comprovante-${order.orderNumber}.jpg`}
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors border border-gray-200 shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        BAIXAR COMPROVANTE
                      </a>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações de Gestão</h3>
                    <div className="flex flex-col gap-2">
                      <ConfirmOrderButton
                        orderId={order.id}
                        isConfirmed={order.status === "CONFIRMED"}
                        loyaltyApplied={order.loyaltyApplied}
                        sacosCredited={order.sacosCredited}
                      />
                      {(order.needsInvoice || order.invoiceNumber) && (
                        <InvoiceActions orderId={order.id} />
                      )}
                    </div>
                    
                    {order.status === "CONFIRMED" && order.loyaltyApplied && (
                      <div className="text-[11px] font-bold text-green-700 bg-green-50 p-3 rounded-xl border border-green-100 flex flex-col gap-1">
                        {order.pointsAwarded > 0 && <span>✓ {order.pointsAwarded} PONTOS CREDITADOS</span>}
                        {order.sacosCredited > 0 && <span>✓ {order.sacosCredited} SACOS NA META DO LOJISTA</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <div className="text-4xl mb-4">🛍️</div>
            <p className="text-gray-500 font-medium">Nenhum pedido recebido ainda.</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8 pb-10">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <Link
                key={p}
                href={`/admin/pedidos?status=${currentStatus}&page=${p}`}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                  page === p
                    ? "bg-[var(--zice-medium)] text-white shadow-lg"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
