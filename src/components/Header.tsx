"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/fidelidade", label: "Fidelidade" },
  { href: "/contato", label: "Contato" },
];

export function Header({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 ice-gradient shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Z-ice Gelo"
            width={56}
            height={56}
            className="rounded-lg bg-white/20 p-1"
          />
          <div className="hidden sm:block text-white">
            <span className="font-bold text-xl">Z-ice Gelo</span>
            <p className="text-xs text-[var(--zice-light)]">Guaramirim — SC</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-white/90 hover:text-white font-medium transition",
                pathname === l.href && "text-white underline underline-offset-4"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={userName ? "/minha-conta" : "/login"}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <User size={16} />
            {userName || "Entrar"}
          </Link>
        </nav>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/20 px-4 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-white font-medium py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={userName ? "/minha-conta" : "/login"}
            className="text-white font-medium py-2"
            onClick={() => setOpen(false)}
          >
            {userName ? "Minha conta" : "Entrar"}
          </Link>
        </nav>
      )}
    </header>
  );
}
