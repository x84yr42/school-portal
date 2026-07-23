import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { isAnnouncementVisible } from "@/lib/announcement-filter";
import { Archive } from "lucide-react";
import Link from "next/link";
import { AnnouncementsClient } from "./announcements-client";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await auth();

  const children = await prisma.family.findMany({
    where: { userId: session?.user?.id },
    include: {
      student: {
        include: {
          enrollments: { include: { class: true } },
          workshopEnrollments: { include: { workshopGroup: true } },
        },
      },
    },
  });

  const context = {
    grades: children.map((f) => f.student.enrollments[0]?.class?.grade).filter(Boolean) as number[],
    classIds: children.map((f) => f.student.enrollments[0]?.classId).filter(Boolean) as string[],
    workshopIds: children.flatMap((f) =>
      f.student.workshopEnrollments.map((e) => e.workshopGroupId)
    ),
  };

  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    include: {
      author: true,
      reads: {
        where: { userId: session?.user?.id },
        select: { acknowledgedAt: true, archivedAt: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  // Filter out archived announcements and apply visibility
  const visibleAnnouncements = announcements
    .filter((a) => {
      const read = a.reads[0];
      return !read?.archivedAt;
    })
    .filter((a) => isAnnouncementVisible(a.targetAudience, context))
    .map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      priority: a.priority,
      createdAt: a.createdAt.toISOString(),
      requiresAck: a.requiresAck,
      author: { name: a.author.name },
      hasAcknowledged: a.reads.length > 0 && a.reads[0]?.acknowledgedAt !== null,
    }));

  // Count archived
  const archivedCount = announcements.filter((a) => {
    const read = a.reads[0];
    return read?.archivedAt !== null;
  }).length;

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
        {archivedCount > 0 && (
          <Link
            href="/announcements/archived"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Archive className="h-4 w-4" />
            Archived ({archivedCount})
          </Link>
        )}
      </div>

      <p className="text-xs text-gray-500">Swipe left on an announcement to archive it.</p>

      <AnnouncementsClient announcements={visibleAnnouncements} />

      {visibleAnnouncements.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No announcements to show.</p>
        </div>
      )}
    </div>
  );
}
