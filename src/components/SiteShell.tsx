"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function SiteShell({
  children,
  userName,
  whatsapp,
}: {
  children: React.ReactNode;
  userName?: string | null;
  whatsapp: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header userName={userName} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppButton phone={whatsapp} />
    </>
  );
}
