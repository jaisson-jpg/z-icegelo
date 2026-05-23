import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { RewardTargetType, RewardAudience } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const reward = await prisma.loyaltyReward.findUnique({ where: { id } });
  if (!reward) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const formData = await req.formData();
  const image = formData.get("image") as File | null;
  let imageUrl = reward.imageUrl;
  if (image && image.size > 0) {
    imageUrl = await saveUpload(image, "rewards");
  }

  await prisma.loyaltyReward.update({
    where: { id },
    data: {
      name: (formData.get("name") as string)?.trim() || reward.name,
      description: formData.has("description")
        ? ((formData.get("description") as string)?.trim() || null)
        : reward.description,
      targetType: (formData.get("targetType") as RewardTargetType) || reward.targetType,
      targetValue: formData.has("targetValue")
        ? parseInt(formData.get("targetValue") as string)
        : reward.targetValue,
      rewardLabel: (formData.get("rewardLabel") as string) || reward.rewardLabel,
      audience: (formData.get("audience") as RewardAudience) || reward.audience,
      sortOrder: formData.has("sortOrder")
        ? parseInt(formData.get("sortOrder") as string)
        : reward.sortOrder,
      active: formData.get("active") === "true",
      imageUrl,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.loyaltyReward.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
