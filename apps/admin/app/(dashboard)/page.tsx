import { Card, CardContent, CardHeader, CardTitle } from "@school-portal/ui";
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
import { Button } from "@school-portal/ui";

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
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-600" },
    { label: "Total Teachers", value: stats.totalTeachers, icon: GraduationCap, color: "text-indigo-600" },
    { label: "Published Announcements", value: stats.totalAnnouncements, icon: Megaphone, color: "text-green-600" },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: CreditCard, color: "text-red-600" },
    { label: "Upcoming Activities", value: stats.upcomingActivities, icon: CalendarCheck, color: "text-purple-600" },
  ];

  const quickActions = [
    { href: "/students", label: "Add Student", icon: UserPlus, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    { href: "/announcements", label: "Create Announcement", icon: Megaphone, color: "bg-green-50 text-green-600 hover:bg-green-100" },
    { href: "/billing", label: "Generate Invoice", icon: FileText, color: "bg-red-50 text-red-600 hover:bg-red-100" },
    { href: "/students/import", label: "Import CSV", icon: Download, color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.label}</CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Acknowledgements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Activity Acknowledgements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <CheckCircle className="mx-auto h-6 w-6 text-green-600" />
              <p className="mt-2 text-2xl font-bold text-green-700">{stats.approved}</p>
              <p className="text-sm text-green-600">Approved</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <XCircle className="mx-auto h-6 w-6 text-red-600" />
              <p className="mt-2 text-2xl font-bold text-red-700">{stats.declined}</p>
              <p className="text-sm text-red-600">Declined</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Clock className="mx-auto h-6 w-6 text-gray-600" />
              <p className="mt-2 text-2xl font-bold text-gray-700">
                {stats.totalStudentsCount - stats.totalResponses}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">
            {stats.totalResponses} of {stats.totalStudentsCount} students have responded (
            {stats.totalStudentsCount > 0
              ? Math.round((stats.totalResponses / stats.totalStudentsCount) * 100)
              : 0}
            %)
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-colors ${action.color}`}>
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Welcome */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Welcome to Little Scholars Admin</h3>
        <p className="mt-2 text-gray-600">
          Use the sidebar to manage students, teachers, workshops, announcements, activities, billing, and more.
        </p>
      </div>
    </div>
  );
}
