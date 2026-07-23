import { prisma } from "@school-portal/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Clock } from "@school-portal/ui";

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
        <Link href="/workshops" className="text-black/30 hover:text-black/60 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-headline text-black">{workshop.name}</h2>
          <p className="text-body-sm text-black/50">{workshop.description || "No description"}</p>
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
              <p className="text-caption">Status</p>
              <Badge variant={workshop.isActive ? "green" : "gray"}>
                {workshop.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {workshop.teacher && (
              <div>
                <p className="text-caption">Teacher</p>
                <p className="text-black">{workshop.teacher.name}</p>
              </div>
            )}
            {workshop.scheduleDay != null && (
              <div>
                <p className="text-caption">Schedule</p>
                <div className="flex items-center gap-2 text-black">
                  <Calendar className="h-4 w-4 text-black/30" />
                  <span>{DAYS[workshop.scheduleDay]}</span>
                  {workshop.scheduleStartTime && (
                    <>
                      <Clock className="h-4 w-4 text-black/30" />
                      <span>{workshop.scheduleStartTime} - {workshop.scheduleEndTime}</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-caption">Enrolled Students</p>
              <p className="text-black tabular-nums">{workshop.enrollments.length}</p>
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
              <table className="w-full text-body-sm">
                <thead className="text-left text-black/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Parents</th>
                    <th className="px-4 py-3 font-medium">Enrolled Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f1f1]">
                  {workshop.enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-[#f7f7f5] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/students/${e.student.id}`} className="font-[480] text-black hover:underline underline-offset-4">
                          {e.student.firstName} {e.student.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-black/60">
                        {e.student.enrollments[0]?.class?.name ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 text-black/60">
                        {e.student.families.map((f) => f.user.name).join(", ") || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-black/60">
                        {formatDate(e.startDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-body-sm text-black/50">No students enrolled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
