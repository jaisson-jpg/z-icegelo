import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { ConfirmOrderButton } from "@/components/admin/ConfirmOrderButton";
import { InvoiceActions } from "@/components/InvoiceActions";
import { ProgressBar } from "@/components/ProgressBar";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  noStore();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
      user: { include: { lojista: true } },
    },
  });

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
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-6">Pedidos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Confirme o PIX para creditar pontos e sacos automaticamente ao lojista.
      </p>

      <div className="space-y-4">
        {orders.map((order) => {
          const lojista = order.user?.lojista;
          return (
            <div key={order.id} className="bg-white rounded-xl border p-4 sm:p-6">
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-lg">{order.orderNumber}</p>
                  <p className="text-gray-600">{order.customerName} — {order.customerPhone}</p>
                  {lojista && (
                    <p className="text-xs text-[var(--zice-medium)] font-semibold mt-1">
                      🏪 Lojista: {lojista.businessName}
                    </p>
                  )}
                  {!order.userId && order.category === "ATACADO" && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠ Sem login — vincula pelo telefone ao confirmar
                    </p>
                  )}
                  {order.address && <p className="text-sm text-gray-500 truncate">{order.address}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-[var(--zice-medium)]">
                    {formatCurrency(order.total)}
                  </p>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full mt-1 ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>

              {lojista && order.status === "CONFIRMED" && (
                <div className="mb-4 p-3 bg-[var(--zice-ice)] rounded-lg">
                  <p className="text-xs font-semibold text-[var(--zice-dark)] mb-2">
                    Progresso do lojista após este pedido:
                  </p>
                  <ProgressBar
                    value={lojista.sacosComprados}
                    max={lojista.sacosGratisMeta}
                    size="sm"
                    label={`${lojista.sacosComprados}/${lojista.sacosGratisMeta} sacos`}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Pontos: <strong>{order.user?.points ?? 0}</strong> | Total histórico:{" "}
                    <strong>{lojista.totalSacosHistorico}</strong> sacos
                  </p>
                </div>
              )}

              <ul className="text-sm text-gray-600 mb-4">
                {order.items.map((i) => (
                  <li key={i.id}>
                    {i.product.name} x{i.quantity} — {formatCurrency(i.subtotal)}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 items-start">
                {order.pixReceiptUrl && (
                  <a href={order.pixReceiptUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Image
                      src={order.pixReceiptUrl}
                      alt="Comprovante PIX"
                      width={100}
                      height={100}
                      className="rounded-lg border object-cover"
                    />
                  </a>
                )}
                <div className="flex flex-col gap-2">
                  <ConfirmOrderButton
                    orderId={order.id}
                    isConfirmed={order.status === "CONFIRMED"}
                    loyaltyApplied={order.loyaltyApplied}
                    sacosCredited={order.sacosCredited}
                  />
                  {order.status === "CONFIRMED" && order.loyaltyApplied && (
                    <div className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                      {order.pointsAwarded > 0 && <p>✓ +{order.pointsAwarded} pontos</p>}
                      {order.sacosCredited > 0 && <p>✓ +{order.sacosCredited} sacos creditados</p>}
                    </div>
                  )}
                </div>
                {(order.needsInvoice || order.invoiceNumber) && (
                  <InvoiceActions orderId={order.id} />
                )}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-gray-500">Nenhum pedido ainda.</p>}
      </div>
    </div>
  );
}
