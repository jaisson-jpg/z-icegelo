import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "main" },
      select: {
        announcementTitle: true,
        announcementText: true,
        announcementActive: true,
      }
    });
    
    return NextResponse.json({
      title: config?.announcementTitle,
      text: config?.announcementText,
      active: config?.announcementActive || false,
    });
  } catch (e) {
    return NextResponse.json({ active: false }, { status: 500 });
  }
}
