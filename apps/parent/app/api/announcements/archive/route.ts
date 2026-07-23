import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { announcementId } = await req.json();
  if (!announcementId) {
    return new NextResponse("Missing announcementId", { status: 400 });
  }

  const read = await prisma.announcementRead.upsert({
    where: {
      announcementId_userId: {
        announcementId,
        userId: session.user.id,
      },
    },
    update: {
      archivedAt: new Date(),
    },
    create: {
      announcementId,
      userId: session.user.id,
      archivedAt: new Date(),
    },
  });

  return NextResponse.json(read);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { announcementId } = await req.json();
  if (!announcementId) {
    return new NextResponse("Missing announcementId", { status: 400 });
  }

  const read = await prisma.announcementRead.update({
    where: {
      announcementId_userId: {
        announcementId,
        userId: session.user.id,
      },
    },
    data: {
      archivedAt: null,
    },
  });

  return NextResponse.json(read);
}
