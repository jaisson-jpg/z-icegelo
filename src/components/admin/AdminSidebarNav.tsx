"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🛍️", badge: true },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-4 space-y-2 opacity-0">Carregando...</div>;

  return (
    <nav className="p-4 space-y-1">
      {navItems.map(({ href, label, icon }) => (
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
        </Link>
      ))}
    </nav>
  );
}
