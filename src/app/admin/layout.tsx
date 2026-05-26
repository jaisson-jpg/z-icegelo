import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/estoque", label: "Estoque" },
  { href: "/admin/lojistas", label: "Lojistas" },
  { href: "/admin/recompensas", label: "Recompensas" },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/config", label: "Configurações" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 ice-gradient text-white shrink-0 hidden md:block print:hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="font-bold text-lg">Admin Z-ice</h2>
          <p className="text-xs text-[var(--zice-light)]">{session.name}</p>
        </div>
        <AdminSidebarNav />
        <div className="p-4 mt-auto">
          <Link href="/" className="text-sm text-[var(--zice-light)] hover:underline block mb-3">
            ← Ver site
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="md:hidden ice-gradient text-white p-4 flex justify-between items-center">
          <span className="font-bold">Admin Z-ice</span>
          <div className="flex gap-2 text-xs flex-wrap">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:underline">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6 max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
