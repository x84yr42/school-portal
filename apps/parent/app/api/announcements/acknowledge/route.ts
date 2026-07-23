import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { announcementId } = body;
    if (!announcementId) {
      return NextResponse.json({ error: "announcementId required" }, { status: 400 });
    }

    // Upsert the AnnouncementRead record with acknowledgedAt
    const read = await prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId,
          userId: session.user.id,
        },
      },
      create: {
        announcementId,
        userId: session.user.id,
        acknowledgedAt: new Date(),
      },
      update: {
        acknowledgedAt: new Date(),
      },
    });

    // Also mark the notification as read
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        type: "ANNOUNCEMENT",
        data: { path: ["announcementId"], equals: announcementId },
      },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json(read);
  } catch (error) {
    return NextResponse.json({ error: "Failed to acknowledge announcement" }, { status: 500 });
  }
}
