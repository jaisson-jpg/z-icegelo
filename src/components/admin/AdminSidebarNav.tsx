"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", key: "dashboard" },
  { href: "/admin/caixa", label: "Caixa & Lucro", icon: "💰" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🛍️", key: "pendingOrders" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥", key: "totalCustomers" },
  { href: "/admin/lojistas", label: "Lojistas", icon: "🏪" },
  { href: "/admin/produtos", label: "Produtos", icon: "📦" },
  { href: "/admin/estoque", label: "Estoque", icon: "📉" },
  { href: "/admin/recompensas", label: "Recompensas", icon: "🎁" },
  { href: "/admin/relatorios", label: "Relatórios", icon: "📈" },
  { href: "/admin/config", label: "Configurações", icon: "⚙️" },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ pendingOrders: 0, totalCustomers: 0 });

  useEffect(() => {
    setMounted(true);

    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (e) {
        console.error("Erro ao buscar notificações:", e);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="p-4 space-y-2 opacity-0">Carregando...</div>;

  return (
    <nav className="p-4 space-y-1">
      {navItems.map(({ href, label, icon, key }) => {
        const badgeValue = key ? counts[key as keyof typeof counts] : 0;
        const showBadge = (key === "pendingOrders" && badgeValue > 0) || (key === "totalCustomers");

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition text-sm font-medium ${
              pathname === href ? "bg-white/30 text-white" : "hover:bg-white/20 text-white/90"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              {label}
            </div>
            {showBadge && badgeValue > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                key === "pendingOrders" ? "bg-red-500 text-white animate-pulse" : "bg-blue-500 text-white"
              }`}>
                {badgeValue}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
