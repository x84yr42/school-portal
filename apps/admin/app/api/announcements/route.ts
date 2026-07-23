import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        body: body.body,
        category: body.category || "GENERAL",
        priority: body.priority || "NORMAL",
        targetAudience: body.targetAudience,
        requiresAck: body.requiresAck || false,
        createdBy: body.createdBy,
        publishedAt: body.publishNow ? new Date() : null,
        isPublished: body.publishNow || false,
      },
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
