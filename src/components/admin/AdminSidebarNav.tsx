"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Store, 
  Gift, 
  BarChart3, 
  Settings,
  Users
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, badge: true },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/lojistas", label: "Lojistas", icon: Store },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/recompensas", label: "Recompensas", icon: Gift },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/orders/pending-count");
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data.count === "number") {
          setPendingCount(data.count);
        }
      } catch (e) {}
    }
    
    fetchCount();
  }, []);

  if (!mounted) return <div className="p-4 space-y-2 opacity-0">Carregando...</div>;

  return (
    <nav className="p-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition text-sm font-medium ${
            pathname === href ? "bg-white/30 text-white" : "hover:bg-white/20 text-white/90"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            {label}
          </div>
          {badge && pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce shadow-lg border border-white/20">
              {pendingCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
