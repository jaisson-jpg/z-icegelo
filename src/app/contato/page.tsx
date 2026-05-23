import { Phone, MapPin, MessageCircle, Clock } from "lucide-react";

export default function ContatoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--zice-dark)] text-center mb-10">Contato</h1>

      <div className="ice-card rounded-2xl p-8 space-y-6">
        <div className="flex items-start gap-4">
          <MapPin className="text-[var(--zice-medium)] shrink-0" size={28} />
          <div>
            <h2 className="font-bold text-[var(--zice-dark)]">Fábrica</h2>
            <p className="text-gray-600">
              Z-ice Gelo — Fábrica nova em Guaramirim, Santa Catarina
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Phone className="text-[var(--zice-medium)] shrink-0" size={28} />
          <div>
            <h2 className="font-bold text-[var(--zice-dark)]">Telefone / WhatsApp</h2>
            <a href="tel:+5547996471803" className="text-2xl font-bold text-[var(--zice-medium)] hover:underline">
              (47) 99647-1803
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Clock className="text-[var(--zice-medium)] shrink-0" size={28} />
          <div>
            <h2 className="font-bold text-[var(--zice-dark)]">Atendimento</h2>
            <p className="text-gray-600">Entrega rápida de emergência 24 horas</p>
            <p className="italic text-[var(--zice-dark)] mt-2 font-semibold">
              Faltou gelo? Fique Zem.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/5547996471803?text=Olá! Preciso de gelo urgente."
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full text-lg justify-center"
        >
          <MessageCircle size={24} />
          Chamar no WhatsApp
        </a>
      </div>
    </div>
  );
}
