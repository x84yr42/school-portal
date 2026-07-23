import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { isAnnouncementVisible } from "@/lib/announcement-filter";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

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
        select: { acknowledgedAt: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  const visibleAnnouncements = announcements.filter((a) =>
    isAnnouncementVisible(a.targetAudience, context)
  );

  return (
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Announcements</h2>

      <div className="space-y-3">
        {visibleAnnouncements.map((announcement) => {
          const hasAcknowledged = announcement.reads.length > 0 && announcement.reads[0]?.acknowledgedAt !== null;
          return (
            <Link key={announcement.id} href={`/announcements/${announcement.id}`}>
              <Card className="transition-colors hover:bg-gray-50">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base leading-tight">{announcement.title}</CardTitle>
                      {hasAcknowledged && (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      )}
                    </div>
                    <Badge
                      variant={announcement.priority === "EMERGENCY" ? "red" : "default"}
                      className="shrink-0"
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(announcement.createdAt)} · {announcement.author.name}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="line-clamp-2 text-sm text-gray-700">{announcement.body}</p>
                  {announcement.requiresAck && (
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                      hasAcknowledged
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {hasAcknowledged ? "Acknowledged" : "Requires acknowledgment"}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {visibleAnnouncements.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No announcements to show.</p>
        </div>
      )}
    </div>
  );
}
