"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [instaUrl, setInstaUrl] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.instagramUrl) setInstaUrl(data.instagramUrl);
      })
      .catch(() => {});
  }, []);

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
          
          {instaUrl && (
            <a 
              href={instaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-pink-200 transition-all flex items-center justify-center w-9 h-9 bg-white/10 rounded-full"
              title="Siga-nos no Instagram"
            >
              <Instagram size={20} strokeWidth={2.5} />
            </a>
          )}

          <Link
            href={userName ? "/minha-conta" : "/login"}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <User size={16} />
            {userName || "Entrar"}
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {instaUrl && (
            <a 
              href={instaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-pink-200 transition-all flex items-center justify-center w-10 h-10 bg-white/10 rounded-full"
            >
              <Instagram size={24} strokeWidth={2.5} />
            </a>
          )}
          <button
            className="text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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
