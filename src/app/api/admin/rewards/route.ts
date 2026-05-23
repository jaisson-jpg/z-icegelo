import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { RewardTargetType, RewardAudience } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const targetType = formData.get("targetType") as string;
  const targetValue = parseInt(formData.get("targetValue") as string);
  const rewardLabel = (formData.get("rewardLabel") as string) || "Recompensa";
  const audience = (formData.get("audience") as string) || "TODOS";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const active = formData.get("active") !== "false";
  const image = formData.get("image") as File | null;

  if (!name || !targetType || isNaN(targetValue)) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  let imageUrl: string | null = null;
  if (image && image.size > 0) {
    imageUrl = await saveUpload(image, "rewards");
  }

  const reward = await prisma.loyaltyReward.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      targetType: targetType as RewardTargetType,
      targetValue,
      rewardLabel,
      audience: audience as RewardAudience,
      sortOrder,
      active,
      imageUrl,
    },
  });

  return NextResponse.json({ id: reward.id });
}
