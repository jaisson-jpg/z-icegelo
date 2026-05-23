import Image from "next/image";
import { ProgressBar } from "./ProgressBar";

type Reward = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  targetType: string;
  targetValue: number;
  rewardLabel: string;
};

export function LoyaltyRewardsList({
  rewards,
  currentValue,
  type,
}: {
  rewards: Reward[];
  currentValue: number;
  type: "POINTS" | "SACOS";
}) {
  const filtered = rewards.filter((r) => r.targetType === type);
  if (filtered.length === 0) return null;

  return (
    <div className="space-y-6">
      {filtered.map((r) => {
        const remaining = Math.max(0, r.targetValue - currentValue);
        return (
          <div key={r.id} className="ice-card rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {r.imageUrl ? (
                <Image
                  src={r.imageUrl}
                  alt={r.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover w-20 h-20 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 ice-gradient rounded-lg flex items-center justify-center text-3xl shrink-0">
                  🎁
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--zice-dark)]">{r.name}</h3>
                {r.description && (
                  <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                )}
                <p className="text-sm font-semibold text-[var(--zice-medium)] mt-2">
                  Prêmio: {r.rewardLabel}
                </p>
                <div className="mt-4">
                  <ProgressBar
                    value={currentValue}
                    max={r.targetValue}
                    label={`${currentValue} / ${r.targetValue} ${type === "POINTS" ? "pontos" : "sacos"}`}
                    sublabel={
                      remaining > 0
                        ? `Faltam ${remaining}`
                        : "Meta atingida! 🎉"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
