import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LojistaContract } from "@/components/admin/LojistaContract";

export const dynamic = "force-dynamic";

export default async function ContratoLojistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lojista = await prisma.lojista.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      freezers: true,
    },
  });

  if (!lojista) notFound();

  return <LojistaContract lojista={lojista} />;
}
