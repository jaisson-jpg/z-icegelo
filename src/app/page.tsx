import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/utils";
import { ProductGrid } from "@/components/ProductGrid";
import {
  Factory,
  Truck,
  Award,
  ShoppingBag,
  Snowflake,
  Phone,
  ArrowRight,
} from "lucide-react";

export const revalidate = 10;

export default async function HomePage() {
  const [products, config] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
      include: { stockCategory: true }
    }),
    prisma.siteConfig.findUnique({ where: { id: "main" } }),
  ]);

  const phone = config?.whatsapp ?? "5547996471803";

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
              <a href={`tel:+${phone}`} className="btn-outline bg-white/10 border-white text-white hover:bg-white/20">
                <Phone size={20} />
                {formatPhone(phone)}
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

      {/* Seção de Fidelidade com Destaque */}
      <section className="py-12 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="ice-card rounded-3xl p-8 md:p-12 relative overflow-hidden border-2 border-[var(--zice-light)]">
            <div className="absolute top-0 right-0 w-64 h-64 ice-gradient opacity-10 rounded-full -mr-20 -mt-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 md:w-24 md:h-24 ice-gradient rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <Award className="text-white" size={48} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--zice-dark)] mb-2">
                  Diferencial Z-ice Fidelidade
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Aqui você ganha benefícios reais! <strong className="text-[var(--zice-medium)]">Clientes</strong> acumulam pontos para prêmios e <strong className="text-[var(--zice-medium)]">Lojistas</strong> ganham sacos de gelo grátis direto na meta.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link href="/fidelidade" className="text-[var(--zice-dark)] font-bold flex items-center gap-2 hover:underline">
                    Ver como funciona <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
              <Link href="/cadastro" className="btn-primary px-8 py-4 whitespace-nowrap">
                Quero meus benefícios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[var(--zice-dark)]">Nossos Produtos</h2>
            <p className="text-gray-600">Gelo puro e cristalino para sua necessidade</p>
          </div>
          <Link href="/loja" className="text-[var(--zice-medium)] font-bold flex items-center gap-1 hover:underline">
            Ver loja completa <ArrowRight size={16} />
          </Link>
        </div>
        <ProductGrid products={products.map(p => ({
          ...p,
          price: Number(p.price),
          category: p.category as "VAREJO" | "ATACADO",
          isComingSoon: !!p.isComingSoon,
          stock: p.stockCategory ? p.stockCategory.quantity : p.stock
        }))} />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 border-t">
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
