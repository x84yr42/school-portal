import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Archive } from "lucide-react";
import Link from "next/link";
import { AnnouncementsClient } from "../announcements-client";

export const dynamic = "force-dynamic";

export default async function ArchivedAnnouncementsPage() {
  const session = await auth();

  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      reads: {
        some: {
          userId: session?.user?.id,
          archivedAt: { not: null },
        },
      },
    },
    include: {
      author: true,
      reads: {
        where: { userId: session?.user?.id },
        select: { acknowledgedAt: true, archivedAt: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  const archivedAnnouncements = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    priority: a.priority,
    createdAt: a.createdAt.toISOString(),
    requiresAck: a.requiresAck,
    author: { name: a.author.name },
    hasAcknowledged: a.reads.length > 0 && a.reads[0]?.acknowledgedAt !== null,
  }));

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-black/60" />
          <h2 className="text-headline text-black">Archived Announcements</h2>
        </div>
        <Link
          href="/announcements"
          className="text-body-sm text-black hover:underline underline-offset-4"
        >
          Back to Announcements
        </Link>
      </div>

      <p className="text-caption text-black/50">Swipe left on an announcement to unarchive it.</p>

      <AnnouncementsClient announcements={archivedAnnouncements} showArchived />

      {archivedAnnouncements.length === 0 && (
        <div className="rounded-[24px] border border-[#e6e6e6] bg-white p-8 text-center">
          <p className="text-black/50">No archived announcements.</p>
        </div>
      )}
    </div>
  );
}
