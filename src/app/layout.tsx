import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Z-ice Gelo | Gelo em Guaramirim — Atacado e Varejo",
  description:
    "Z-ice Gelo — Fábrica nova em Guaramirim, SC. Entrega rápida de emergência 24h. Atacado e varejo. Faltou gelo? Fique Zem.",
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
  try {
    const config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
    if (config?.whatsapp) whatsapp = config.whatsapp;
  } catch {
    /* db not ready */
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {isAdmin ? (
          <main>{children}</main>
        ) : (
          <SiteShell userName={session?.name} whatsapp={whatsapp}>
            {children}
          </SiteShell>
        )}
      </body>
    </html>
  );
}
