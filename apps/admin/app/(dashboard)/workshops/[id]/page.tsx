import { prisma } from "@school-portal/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workshop = await prisma.workshopGroup.findUnique({
    where: { id },
    include: {
      teacher: true,
      enrollments: {
        include: {
          student: {
            include: {
              families: { include: { user: true } },
              enrollments: { include: { class: true } },
            },
          },
        },
        orderBy: { student: { lastName: "asc" } },
      },
    },
  });

  if (!workshop) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workshops" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{workshop.name}</h2>
          <p className="text-sm text-gray-500">{workshop.description || "No description"}</p>
        </div>
      </div>

      {/* Workshop Info */}
      <Card>
        <CardHeader>
          <CardTitle>Workshop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={workshop.isActive ? "green" : "gray"}>
                {workshop.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {workshop.teacher && (
              <div>
                <p className="text-sm font-medium text-gray-500">Teacher</p>
                <p className="text-gray-900">{workshop.teacher.name}</p>
              </div>
            )}
            {workshop.scheduleDay != null && (
              <div>
                <p className="text-sm font-medium text-gray-500">Schedule</p>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{DAYS[workshop.scheduleDay]}</span>
                  {workshop.scheduleStartTime && (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{workshop.scheduleStartTime} - {workshop.scheduleEndTime}</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Enrolled Students</p>
              <p className="text-gray-900">{workshop.enrollments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enrolled Students ({workshop.enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workshop.enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Parents</th>
                    <th className="px-4 py-3 font-medium">Enrolled Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workshop.enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/students/${e.student.id}`} className="font-medium text-blue-600 hover:underline">
                          {e.student.firstName} {e.student.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {e.student.enrollments[0]?.class?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {e.student.families.map((f) => f.user.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(e.startDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No students enrolled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
