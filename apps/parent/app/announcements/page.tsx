import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { isAnnouncementVisible } from "@/lib/announcement-filter";
import { Archive } from "@school-portal/ui";
import Link from "next/link";
import { Eyebrow } from "@school-portal/ui";
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

  const archivedCount = announcements.filter((a) => {
    const read = a.reads[0];
    return read?.archivedAt !== null;
  }).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header strip */}
      <div className="rounded-b-[24px] bg-block-lilac px-4 py-8">
        <div>
          <Eyebrow>NEWS</Eyebrow>
          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-display-lg text-black leading-none">Announcements</h2>
            {archivedCount > 0 && (
              <Link
                href="/announcements/archived"
                className="flex items-center gap-2 text-body-sm font-[480]"
              >
                <Archive size={16} />
                Archived ({archivedCount})
              </Link>
            )}
          </div>
          <p className="text-body-sm mt-2">Swipe left to archive.</p>
        </div>
      </div>

      <div className="px-4">
        <AnnouncementsClient announcements={visibleAnnouncements} />

        {visibleAnnouncements.length === 0 && (
          <div className="rounded-[24px] border border-[#e6e6e6] bg-white p-8 text-center">
            <p className="text-body-sm">No announcements to show.</p>
          </div>
        )}
      </div>
    </div>
  );
}
