import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { isAnnouncementVisible } from "@/lib/announcement-filter";
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
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });

  const visibleAnnouncements = announcements.filter((a) =>
    isAnnouncementVisible(a.targetAudience, context)
  );

  return (
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Announcements</h2>

      <div className="space-y-3">
        {visibleAnnouncements.map((announcement) => (
          <Link key={announcement.id} href={`/announcements/${announcement.id}`}>
            <Card className="transition-colors hover:bg-gray-50">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{announcement.title}</CardTitle>
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
                  <span className="mt-2 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    Requires acknowledgment
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
