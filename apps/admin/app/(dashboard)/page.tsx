import { Card, CardContent, CardHeader, CardTitle } from "@school-portal/ui";
import { prisma } from "@school-portal/database";
import { Users, Megaphone, CreditCard, CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalStudents, totalAnnouncements, pendingInvoices, upcomingActivities] =
    await Promise.all([
      prisma.student.count(),
      prisma.announcement.count({ where: { isPublished: true } }),
      prisma.invoice.count({
        where: {
          status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
        },
      }),
      prisma.activity.count({
        where: {
          status: { in: ["ACTIVE"] },
          deadline: { gte: new Date() },
        },
      }),
    ]);

  return {
    totalStudents,
    totalAnnouncements,
    pendingInvoices,
    upcomingActivities,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-600" },
    { label: "Published Announcements", value: stats.totalAnnouncements, icon: Megaphone, color: "text-green-600" },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: CreditCard, color: "text-red-600" },
    { label: "Upcoming Activities", value: stats.upcomingActivities, icon: CalendarCheck, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Welcome to Little Scholars Admin</h3>
        <p className="mt-2 text-gray-600">
          Use the sidebar to manage students, announcements, activities, billing, schedules, and notifications.
        </p>
      </div>
    </div>
  );
}
