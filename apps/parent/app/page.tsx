import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { Bell, CalendarCheck, CreditCard, Megaphone, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency, daysUntil } from "@school-portal/shared";
import { isAnnouncementVisible } from "@/lib/announcement-filter";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  const children = await prisma.family.findMany({
    where: { userId: user?.id },
    include: {
      student: {
        include: {
          enrollments: { include: { class: true }, take: 1 },
          workshopEnrollments: { include: { workshopGroup: true } },
        },
      },
    },
  });

  const studentIds = children.map((f) => f.student.id);

  const context = {
    grades: children.map((f) => f.student.enrollments[0]?.class?.grade).filter(Boolean) as number[],
    classIds: children.map((f) => f.student.enrollments[0]?.classId).filter(Boolean) as string[],
    workshopIds: children.flatMap((f) =>
      f.student.workshopEnrollments.map((e) => e.workshopGroupId)
    ),
  };

  const [allAnnouncements, activities, invoices, todaySlots, unreadCount] = await Promise.all([
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
    prisma.activity.findMany({
      where: { status: "ACTIVE" },
      orderBy: { deadline: "asc" },
      take: 3,
    }),
    prisma.invoice.findMany({
      where: { studentId: { in: studentIds }, status: { in: ["SENT", "OVERDUE", "PARTIALLY_PAID"] } },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
    prisma.scheduleSlot.findMany({
      where: { dayOfWeek: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1 },
      include: { subject: true, class: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.notification.count({
      where: { userId: user?.id, isRead: false },
    }),
  ]);

  const announcements = allAnnouncements.filter((a) => isAnnouncementVisible(a.targetAudience, context)).slice(0, 3);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good day, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500">Here is what is happening today.</p>
        </div>
        <Link href="/notifications" className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <Megaphone className="mb-2 h-5 w-5 text-blue-600" />
            <div className="text-2xl font-bold">{announcements.length}</div>
            <div className="text-xs text-gray-500">Latest News</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CreditCard className="mb-2 h-5 w-5 text-red-600" />
            <div className="text-2xl font-bold">{invoices.length}</div>
            <div className="text-xs text-gray-500">Pending Bills</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Latest Announcements</CardTitle>
            <Link href="/announcements" className="text-xs text-blue-600">
              See all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {announcements.length === 0 ? (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          ) : (
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block rounded-md bg-gray-50 p-2 text-sm hover:bg-gray-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-900 line-clamp-1">{announcement.title}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(announcement.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Pending Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No pending activities.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="block rounded-md border border-gray-100 p-2 text-sm hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-900">{activity.title}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </div>
                  {activity.deadline && (
                    <div className="text-xs text-red-600">
                      Due in {daysUntil(activity.deadline)} days
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Today&apos;s Classes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {todaySlots.length === 0 ? (
            <p className="text-sm text-gray-500">No classes today.</p>
          ) : (
            <div className="space-y-2">
              {todaySlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm">
                  <span className="font-medium text-gray-900">{slot.subject.name}</span>
                  <span className="text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
