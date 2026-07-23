import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, ColorBlock, Stagger, StaggerItem } from "@school-portal/ui";
import { Bell, ChevronRight } from "@school-portal/ui";
import { daysUntil } from "@school-portal/shared";
import { isAnnouncementVisible } from "@/lib/announcement-filter";
import { HomeAnnouncements } from "@/components/home-announcements";
import Link from "next/link";

export const dynamic = "force-dynamic";

const accentColors = ["lime", "lilac", "cream", "mint", "pink", "coral"] as const;

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

  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [allAnnouncements, activities, invoices, unreadCount] = await Promise.all([
    prisma.announcement.findMany({
      where: { isPublished: true },
      include: {
        reads: {
          where: { userId: user?.id },
          select: { acknowledgedAt: true, archivedAt: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
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
    prisma.notification.count({
      where: { userId: user?.id, isRead: false },
    }),
  ]);

  const childrenWithSchedules = await Promise.all(
    children.map(async (family) => {
      const classId = family.student.enrollments[0]?.classId;
      const workshopIds = family.student.workshopEnrollments.map((e) => e.workshopGroupId);

      const [classSchedule, workshopSchedule] = await Promise.all([
        classId
          ? prisma.scheduleSlot.findMany({
              where: { dayOfWeek: today, classId },
              include: { subject: true },
              orderBy: { startTime: "asc" },
            })
          : Promise.resolve([]),
        workshopIds.length > 0
          ? prisma.workshopGroup.findMany({
              where: { id: { in: workshopIds }, scheduleDay: today },
              select: { name: true, scheduleStartTime: true, scheduleEndTime: true },
            })
          : Promise.resolve([]),
      ]);

      return { student: family.student, classSchedule, workshopSchedule };
    })
  );

  // Hide acknowledged and archived announcements from the home feed so newer ones have room.
  const announcements = allAnnouncements
    .filter((a) => {
      const read = a.reads[0];
      return !read?.acknowledgedAt && !read?.archivedAt;
    })
    .filter((a) => isAnnouncementVisible(a.targetAudience, context));

  const previewAnnouncements = announcements.slice(0, 3).map((a) => ({
    id: a.id,
    title: a.title,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8 p-4">
      {/* Hero */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg text-black leading-none">
            Good day, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-body-sm mt-2">Here is what is happening today.</p>
        </div>
        <Link href="/notifications" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f5]">
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3d8b] text-[10px] font-[480] text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Stats — pastel blocks */}
      <Stagger className="grid grid-cols-2 gap-4">
        <StaggerItem>
          <ColorBlock color="lime" className="p-5">
            <p className="text-caption">LATEST NEWS</p>
            <p className="text-card-title mt-1 tabular-nums">{announcements.length}</p>
          </ColorBlock>
        </StaggerItem>
        <StaggerItem>
          <ColorBlock color="pink" className="p-5">
            <p className="text-caption">PENDING BILLS</p>
            <p className="text-card-title mt-1 tabular-nums">{invoices.length}</p>
          </ColorBlock>
        </StaggerItem>
      </Stagger>

      {/* Announcements preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline text-black">Announcements</h3>
          <Link href="/announcements" className="text-body-sm font-[480]">
            See all
          </Link>
        </div>
        <HomeAnnouncements announcements={previewAnnouncements} />
      </div>

      {/* Pending Activities */}
      <div>
        <h3 className="text-headline text-black mb-4">Activities</h3>
        {activities.length === 0 ? (
          <p className="text-body-sm">No pending activities.</p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="flex items-center justify-between gap-3 rounded-[24px] border border-[#e6e6e6] bg-white p-4 hover:bg-[#f7f7f5] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-body-sm font-[480]">{activity.title}</p>
                  {activity.deadline && (
                    <p className="text-caption mt-1 text-[#ff3d8b]">
                      Due in {daysUntil(activity.deadline)} days
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Per-child schedule cards */}
      {childrenWithSchedules.map((child, idx) => {
        const hasSchedule = child.classSchedule.length > 0 || child.workshopSchedule.length > 0;
        const accent = accentColors[idx % accentColors.length];
        return (
          <Card key={child.student.id}>
            {/* Color accent strip */}
            <div className={`h-2 rounded-t-[24px] bg-block-${accent}`} />
            <CardHeader className="p-4 pb-2">
              <CardTitle>{child.student.firstName}&apos;s Schedule Today</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {!hasSchedule ? (
                <p className="text-body-sm">No classes or workshops today.</p>
              ) : (
                <div className="space-y-3">
                  {child.classSchedule.length > 0 && (
                    <div>
                      <p className="text-caption mb-2">CLASSES</p>
                      <div className="space-y-1">
                        {child.classSchedule.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between rounded-[8px] bg-[#f7f7f5] p-3 text-body-sm">
                            <span className="font-[480]">{slot.subject.name}</span>
                            <span className="text-body-sm">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {child.workshopSchedule.length > 0 && (
                    <div>
                      <p className="text-caption mb-2">WORKSHOPS</p>
                      <div className="space-y-1">
                        {child.workshopSchedule.map((ws, i) => (
                          <div key={i} className="flex items-center justify-between rounded-[8px] bg-[#f7f7f5] p-3 text-body-sm">
                            <span className="font-[480]">{ws.name}</span>
                            <span className="text-body-sm">
                              {ws.scheduleStartTime} - {ws.scheduleEndTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
