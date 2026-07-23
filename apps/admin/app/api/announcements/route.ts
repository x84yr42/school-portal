import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    include: {
      author: true,
      reads: {
        select: { userId: true, readAt: true, acknowledgedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute metrics for each announcement
  const totalParents = await prisma.user.count({ where: { role: "PARENT" } });

  const withMetrics = announcements.map((a) => {
    const totalReads = a.reads.length;
    const acknowledged = a.reads.filter((r) => r.acknowledgedAt !== null).length;
    return {
      ...a,
      reads: undefined,
      metrics: {
        totalParents,
        totalReads,
        acknowledged,
        notAcknowledged: a.requiresAck ? totalParents - acknowledged : 0,
        responseRate: totalParents > 0 ? Math.round((totalReads / totalParents) * 100) : 0,
        ackRate: a.requiresAck && totalParents > 0
          ? Math.round((acknowledged / totalParents) * 100)
          : null,
      },
    };
  });

  return NextResponse.json(withMetrics);
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

    // Auto-create notifications for all parents
    if (body.publishNow) {
      await createNotifications(announcement.id, announcement.title, announcement.body, body.targetAudience);
    }

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const existing = await prisma.announcement.findUnique({ where: { id: body.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const wasPublished = existing.isPublished;
    const isNowPublished = body.publishNow ?? existing.isPublished;

    const announcement = await prisma.announcement.update({
      where: { id: body.id },
      data: {
        title: body.title,
        body: body.body,
        category: body.category || existing.category,
        priority: body.priority || existing.priority,
        targetAudience: body.targetAudience !== undefined ? body.targetAudience : existing.targetAudience,
        requiresAck: body.requiresAck ?? existing.requiresAck,
        isPublished: isNowPublished,
        publishedAt: isNowPublished && !wasPublished ? new Date() : existing.publishedAt,
      },
    });

    // Create notifications if just published
    if (isNowPublished && !wasPublished) {
      await createNotifications(announcement.id, announcement.title, announcement.body, announcement.targetAudience);
    }

    return NextResponse.json(announcement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}

// Helper: create notifications for targeted parents
async function createNotifications(
  announcementId: string,
  title: string,
  body: string,
  targetAudience: string | null
) {
  try {
    let parentIds: string[];

    if (!targetAudience) {
      // All parents
      const parents = await prisma.user.findMany({
        where: { role: "PARENT" },
        select: { id: true },
      });
      parentIds = parents.map((p) => p.id);
    } else {
      const target = JSON.parse(targetAudience);
      if (target.type === "class") {
        const families = await prisma.family.findMany({
          include: { student: { include: { enrollments: { where: { classId: target.value, isActive: true } } } } },
        });
        parentIds = families
          .filter((f) => f.student.enrollments.length > 0)
          .map((f) => f.userId);
      } else if (target.type === "grade") {
        const families = await prisma.family.findMany({
          include: {
            student: {
              include: {
                enrollments: {
                  include: { class: true },
                  where: { isActive: true },
                },
              },
            },
          },
        });
        parentIds = families
          .filter((f) => f.student.enrollments.some((e) => e.class.grade === parseInt(target.value)))
          .map((f) => f.userId);
      } else if (target.type === "workshop") {
        const families = await prisma.family.findMany({
          include: {
            student: {
              include: {
                workshopEnrollments: { where: { workshopGroupId: target.value, isActive: true } },
              },
            },
          },
        });
        parentIds = families
          .filter((f) => f.student.workshopEnrollments.length > 0)
          .map((f) => f.userId);
      } else {
        const parents = await prisma.user.findMany({
          where: { role: "PARENT" },
          select: { id: true },
        });
        parentIds = parents.map((p) => p.id);
      }
    }

    // Deduplicate
    const uniqueIds = [...new Set(parentIds)];

    if (uniqueIds.length > 0) {
      await prisma.notification.createMany({
        data: uniqueIds.map((userId) => ({
          type: "ANNOUNCEMENT" as const,
          title: `New Announcement: ${title}`,
          body: body.length > 200 ? body.substring(0, 200) + "..." : body,
          channels: ["push"],
          userId,
          data: { announcementId, link: `/announcements/${announcementId}` },
        })),
      });
    }
  } catch (error) {
    console.error("Failed to create notifications for announcement:", error);
  }
}
