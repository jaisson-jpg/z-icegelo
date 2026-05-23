import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { formatCpfCnpj } from "@/lib/invoice";
import { InvoicePrintBar } from "@/components/InvoicePrintBar";

export default async function NotaFiscalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });

  if (!order) notFound();

  const doc = order.customerCpfCnpj ? formatCpfCnpj(order.customerCpfCnpj) : "—";
  const nfNumber = order.invoiceNumber || `PENDENTE-${order.orderNumber}`;

  return (
    <>
      <InvoicePrintBar orderId={id} />
      <div className="invoice-page max-w-3xl mx-auto bg-white p-6 sm:p-10 my-4 sm:my-8 shadow-lg print:shadow-none print:m-0">
        <header className="border-b-2 border-[var(--zice-dark)] pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--zice-dark)]">
                {config?.companyName || "Z-ice Gelo"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{config?.companyAddress}</p>
              <p className="text-sm text-gray-600">Tel: {config?.companyPhone}</p>
              {config?.companyCnpj && (
                <p className="text-sm text-gray-600">CNPJ: {config.companyCnpj}</p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-lg font-bold text-[var(--zice-medium)]">NOTA FISCAL</p>
              <p className="text-sm">Nº {nfNumber}</p>
              <p className="text-sm text-gray-500">
                Emissão:{" "}
                {order.invoiceIssuedAt
                  ? new Date(order.invoiceIssuedAt).toLocaleDateString("pt-BR")
                  : new Date().toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm">Pedido: {order.orderNumber}</p>
            </div>
          </div>
        </header>

        <section className="mb-6">
          <h2 className="font-bold text-sm text-gray-500 uppercase mb-2">Destinatário</h2>
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-sm">CPF/CNPJ: {doc}</p>
          <p className="text-sm">Tel: {order.customerPhone}</p>
          {order.address && <p className="text-sm">{order.address}</p>}
        </section>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-[var(--zice-ice)]">
              <th className="text-left p-2">Produto</th>
              <th className="text-center p-2">Qtd</th>
              <th className="text-right p-2">Unit.</th>
              <th className="text-right p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.product.name}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="p-2 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-3 text-right font-bold">
                TOTAL
              </td>
              <td className="p-3 text-right font-bold text-[var(--zice-medium)] text-lg">
                {formatCurrency(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <footer className="text-xs text-gray-500 border-t pt-4">
          <p>Documento auxiliar para controle e declaração. Z-ice Gelo — Guaramirim/SC.</p>
          <p>Status do pedido: {order.status}</p>
        </footer>
      </div>
    </>
  );
}
