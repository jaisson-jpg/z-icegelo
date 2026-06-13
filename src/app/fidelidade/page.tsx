import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function FidelidadePage() {
  const [rewards, config] = await Promise.all([
    prisma.loyaltyReward.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteConfig.findUnique({ where: { id: "main" } }),
  ]);

  const phone = config?.whatsapp ?? "5547996471803";

  const varejo = rewards.filter((r) => r.audience === "VAREJO" || r.audience === "TODOS");
  const atacado = rewards.filter((r) => r.audience === "ATACADO" || r.audience === "TODOS");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--zice-dark)] text-center mb-4">
        Programa Z-ice Fidelidade
      </h1>
      <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto text-sm sm:text-base">
        Ganhe pontos e prêmios exclusivos. Acompanhe seu progresso na sua área do cliente ou lojista.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <RewardSection title="Varejo" rewards={varejo.filter((r) => r.targetType === "POINTS")} />
        <RewardSection title="Atacado — Lojistas" rewards={atacado.filter((r) => r.targetType === "SACOS")} />
      </div>

      <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/cadastro" className="btn-primary">Criar conta</Link>
        <a
          href={`https://wa.me/${phone}?text=Quero ser lojista parceiro Z-ice`}
          className="btn-outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ser parceiro atacado
        </a>
      </div>
    </div>
  );
}

function RewardSection({
  title,
  rewards,
}: {
  title: string;
  rewards: Array<{
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    targetValue: number;
    rewardLabel: string;
    targetType: string;
  }>;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--zice-dark)] mb-4">{title}</h2>
      <div className="space-y-4">
        {rewards.length === 0 ? (
          <p className="text-sm text-gray-500">Em breve novas recompensas!</p>
        ) : (
          rewards.map((r) => (
            <div key={r.id} className="ice-card rounded-xl p-4 flex gap-4">
              {r.imageUrl ? (
                <Image src={r.imageUrl} alt={r.name} width={64} height={64} className="rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 ice-gradient rounded-lg flex items-center justify-center text-2xl shrink-0">🎁</div>
              )}
              <div>
                <h3 className="font-bold text-[var(--zice-dark)]">{r.name}</h3>
                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                <p className="text-sm font-semibold text-[var(--zice-medium)] mt-2">
                  {r.targetValue} {r.targetType === "POINTS" ? "pontos" : "sacos"} → {r.rewardLabel}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
