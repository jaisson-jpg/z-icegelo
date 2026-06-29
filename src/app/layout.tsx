import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartProvider } from "@/components/CartProvider";
import { GlobalAnnouncement } from "@/components/GlobalAnnouncement";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Z-ice Gelo | Gelo em Guaramirim — Atacado e Varejo",
  description:
    "Z-ice Gelo — Fábrica nova em Guaramirim, SC. Entrega rápida de emergência 24h. Atacado e varejo. Faltou gelo? Fique Zem.",
  icons: {
    icon: "/logo.png", 
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  themeColor: "#1e40af",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  let whatsapp = "5547996471803";
  let instagramUrl = "";
  try {
    const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
    if (config?.whatsapp) whatsapp = config.whatsapp;
    if (config?.instagramUrl) instagramUrl = config.instagramUrl;
  } catch {
    /* db not ready */
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        {isAdmin ? (
          <main>{children}</main>
        ) : (
          <CartProvider>
            <GlobalAnnouncement />
            <Header userName={session?.name} instaUrl={instagramUrl} />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
            <WhatsAppButton phone={whatsapp} />
          </CartProvider>
        )}
      </body>
    </html>
  );
}
