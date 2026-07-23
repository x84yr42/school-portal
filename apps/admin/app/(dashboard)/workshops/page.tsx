import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { Users } from "lucide-react";
import { WorkshopForm } from "@/components/workshop-form";
import { WorkshopEnrollmentForm } from "@/components/workshop-enrollment-form";

export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const [workshops, students] = await Promise.all([
    prisma.workshopGroup.findMany({
      include: {
        enrollments: { include: { student: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Workshop Groups</h2>

      <WorkshopForm />

      <WorkshopEnrollmentForm
        workshops={workshops.map((w) => ({ id: w.id, name: w.name }))}
        students={students.map((s) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName }))}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workshops.map((workshop) => (
          <Card key={workshop.id}>
            <CardHeader>
              <CardTitle className="text-lg">{workshop.name}</CardTitle>
              <p className="text-sm text-gray-500">{workshop.description || "No description"}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                {workshop.enrollments.length} students
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
