import { Card, CardContent, CardHeader, CardTitle, ColorBlock, Eyebrow } from "@school-portal/ui";
import { prisma } from "@school-portal/database";
import {
  Users,
  Megaphone,
  CreditCard,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileText,
  Download,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalStudents,
    totalAnnouncements,
    pendingInvoices,
    upcomingActivities,
    totalTeachers,
    activityResponses,
    totalStudentsCount,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.announcement.count({ where: { isPublished: true } }),
    prisma.invoice.count({
      where: { status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } },
    }),
    prisma.activity.count({
      where: { status: "ACTIVE", deadline: { gte: new Date() } },
    }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.activityResponse.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.student.count({ where: { isActive: true } }),
  ]);

  const approved = activityResponses.find((r) => r.status === "APPROVED")?._count ?? 0;
  const declined = activityResponses.find((r) => r.status === "DECLINED")?._count ?? 0;
  const totalResponses = approved + declined;

  return {
    totalStudents,
    totalAnnouncements,
    pendingInvoices,
    upcomingActivities,
    totalTeachers,
    approved,
    declined,
    totalResponses,
    totalStudentsCount,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "lime" as const },
    { label: "Total Teachers", value: stats.totalTeachers, icon: GraduationCap, color: "lilac" as const },
    { label: "Announcements", value: stats.totalAnnouncements, icon: Megaphone, color: "cream" as const },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: CreditCard, color: "pink" as const },
    { label: "Upcoming Activities", value: stats.upcomingActivities, icon: CalendarCheck, color: "mint" as const },
  ];

  const quickActions = [
    { href: "/students", label: "Add Student", icon: UserPlus },
    { href: "/announcements", label: "Create Announcement", icon: Megaphone },
    { href: "/billing", label: "Generate Invoice", icon: FileText },
    { href: "/students/import", label: "Import CSV", icon: Download },
  ];

  return (
    <div className="space-y-12">
      {/* Hero greeting */}
      <div>
        <Eyebrow className="mb-2 block">ADMIN DASHBOARD</Eyebrow>
        <h2 className="text-display-lg text-black">Overview</h2>
      </div>

      {/* Stat Cards — each in a pastel color block */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <ColorBlock key={card.label} color={card.color} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-caption mb-2">{card.label}</p>
                  <p className="text-card-title">{card.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </div>
            </ColorBlock>
          );
        })}
      </div>

      {/* Activity Acknowledgements */}
      <div>
        <Eyebrow className="mb-4 block">ACTIVITY RESPONSES</Eyebrow>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] bg-[#c8e6cd] p-6 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-[#1ea64a]" strokeWidth={1.5} />
                <p className="mt-3 text-card-title">{stats.approved}</p>
                <p className="text-body-sm">Approved</p>
              </div>
              <div className="rounded-[24px] bg-[#efd4d4] p-6 text-center">
                <XCircle className="mx-auto h-6 w-6" strokeWidth={1.5} />
                <p className="mt-3 text-card-title">{stats.declined}</p>
                <p className="text-body-sm">Declined</p>
              </div>
              <div className="rounded-[24px] bg-[#f7f7f5] p-6 text-center">
                <Clock className="mx-auto h-6 w-6" strokeWidth={1.5} />
                <p className="mt-3 text-card-title">
                  {stats.totalStudentsCount - stats.totalResponses}
                </p>
                <p className="text-body-sm">Pending</p>
              </div>
            </div>
            <p className="mt-4 text-center text-body-sm">
              {stats.totalResponses} of {stats.totalStudentsCount} students responded (
              {stats.totalStudentsCount > 0
                ? Math.round((stats.totalResponses / stats.totalStudentsCount) * 100)
                : 0}
              %)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <Eyebrow className="mb-4 block">QUICK ACTIONS</Eyebrow>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[#e6e6e6] bg-white p-6 transition-colors hover:bg-[#f7f7f5]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-body-sm font-[480]">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
