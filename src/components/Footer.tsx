import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="ice-gradient text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-3">Z-ice Gelo</h3>
          <p className="text-[var(--zice-light)] text-sm leading-relaxed">
            Fábrica nova em Guaramirim, Santa Catarina. Gelo de qualidade com
            entrega rápida de emergência 24h. Atacado e varejo.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Localização</h4>
          <p className="flex items-start gap-2 text-sm text-[var(--zice-light)]">
            <MapPin size={18} className="shrink-0 mt-0.5" />
            Guaramirim — Santa Catarina, Brasil
          </p>
          <p className="flex items-center gap-2 text-sm mt-2 text-[var(--zice-light)]">
            <Clock size={18} />
            Entrega de emergência 24 horas
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contato</h4>
          <a
            href="tel:+5547996471803"
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Phone size={18} />
            (47) 99647-1803
          </a>
          <p className="text-sm mt-3 text-[var(--zice-light)] italic">
            Faltou gelo? Fique Zem.
          </p>
          <div className="flex gap-4 mt-4 text-sm">
            <Link href="/loja" className="hover:underline">
              Loja
            </Link>
            <Link href="/fidelidade" className="hover:underline">
              Fidelidade
            </Link>
            <Link href="/login" className="hover:underline">
              Área do cliente
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 text-center py-4 text-sm text-[var(--zice-light)]">
        © {new Date().getFullYear()} Z-ice Gelo — Todos os direitos reservados
      </div>
    </footer>
  );
}
