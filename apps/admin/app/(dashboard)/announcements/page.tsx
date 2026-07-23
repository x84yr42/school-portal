import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { AnnouncementsClient } from "@/components/announcements-client";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await auth();
  const [announcements, classes, workshops, totalParents] = await Promise.all([
    prisma.announcement.findMany({
      include: {
        author: true,
        reads: {
          select: { userId: true, readAt: true, acknowledgedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({ orderBy: [{ grade: "asc" }, { name: "asc" }] }),
    prisma.workshopGroup.findMany({ orderBy: { name: "asc" } }),
    prisma.user.count({ where: { role: "PARENT" } }),
  ]);

  const serialized = announcements.map((a) => {
    const totalReads = a.reads.length;
    const acknowledged = a.reads.filter((r) => r.acknowledgedAt !== null).length;
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      category: a.category,
      priority: a.priority,
      targetAudience: a.targetAudience,
      requiresAck: a.requiresAck,
      isPublished: a.isPublished,
      createdAt: a.createdAt.toISOString(),
      publishedAt: a.publishedAt?.toISOString() ?? null,
      author: { name: a.author.name },
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

  return (
    <AnnouncementsClient
      announcements={serialized}
      classes={classes.map((c) => ({ id: c.id, name: c.name, grade: c.grade }))}
      workshops={workshops.map((w) => ({ id: w.id, name: w.name }))}
      userId={session?.user?.id as string}
    />
  );
}
