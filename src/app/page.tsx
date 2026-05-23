import Image from "next/image";
import Link from "next/link";
import {
  Factory,
  Truck,
  Award,
  ShoppingBag,
  Snowflake,
  Phone,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ice-gradient opacity-95" />
        <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-5 scale-150" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-white text-center md:text-left">
            <span className="inline-block bg-white/20 text-[var(--zice-light)] text-sm font-semibold px-4 py-1 rounded-full mb-4">
              Fábrica Nova — Guaramirim, Santa Catarina
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Gelo de qualidade com entrega{" "}
              <span className="text-[var(--zice-light)]">24 horas</span>
            </h1>
            <p className="text-lg text-white/90 mb-2">
              Atacado para mercados, padarias e comércios. Varejo para você e sua família.
            </p>
            <p className="text-xl font-semibold italic text-[var(--zice-light)] mb-8">
              Faltou gelo? Fique Zem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/loja" className="btn-primary text-lg px-8">
                <ShoppingBag size={20} />
                Comprar agora
              </Link>
              <a href="tel:+5547996471803" className="btn-outline bg-white/10 border-white text-white hover:bg-white/20">
                <Phone size={20} />
                (47) 99647-1803
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/logo.png"
              alt="Z-ice Gelo Logo"
              width={400}
              height={400}
              className="drop-shadow-2xl rounded-2xl max-w-[320px] md:max-w-[400px] w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[var(--zice-dark)] text-center mb-12">
          Por que escolher a Z-ice?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Factory,
              title: "Fábrica em Guaramirim",
              desc: "Produção local em Santa Catarina, gelo sempre fresco e na sua região.",
            },
            {
              icon: Truck,
              title: "Entrega 24h",
              desc: "Entrega rápida de emergência — quando você mais precisa de gelo.",
            },
            {
              icon: ShoppingBag,
              title: "Atacado e Varejo",
              desc: "Do saco unitário ao grande volume para o seu comércio.",
            },
            {
              icon: Award,
              title: "Programa Fidelidade",
              desc: "Ganhe pontos em toda compra. Lojistas ganham sacos de gelo grátis!",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="ice-card rounded-2xl p-6 text-center">
              <div className="w-14 h-14 ice-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-[var(--zice-dark)] mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ice-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <Snowflake className="mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold mb-4">Programa Z-ice Fidelidade</h2>
          <p className="text-lg text-[var(--zice-light)] mb-8">
            Cada compra rende pontos. Lojistas parceiros acumulam sacos comprados e
            ganham <strong>sacos de gelo grátis</strong> ao atingir a meta — o diferencial Z-ice!
          </p>
          <Link href="/fidelidade" className="btn-primary bg-white text-[var(--zice-dark)] hover:bg-[var(--zice-light)]">
            Saiba mais sobre fidelidade
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[var(--zice-dark)] mb-4">
          Pronto para pedir?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Compre pelo site com PIX e confirmação rápida, ou fale direto no WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/loja" className="btn-primary">
            Ver produtos
          </Link>
          <Link href="/contato" className="btn-outline">
            Falar conosco
          </Link>
        </div>
      </section>
    </>
  );
}
