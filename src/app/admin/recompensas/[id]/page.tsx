import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RewardForm } from "@/components/admin/RewardForm";

export default async function EditarRecompensaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reward = await prisma.loyaltyReward.findUnique({ where: { id } });
  if (!reward) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--zice-dark)] mb-6">Editar recompensa</h1>
      <RewardForm reward={reward} />
    </div>
  );
}
