import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { Users } from "lucide-react";
import { ClassForm } from "@/components/class-form";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
      enrollments: { include: { student: true } },
      scheduleSlots: { include: { subject: true } },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  const teachers = await prisma.user.findMany({
    where: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN"] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Classes & Grades</h2>

      <ClassForm teachers={teachers.map((t) => ({ id: t.id, name: t.name }))} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <Badge>Grade {cls.grade}</Badge>
              </div>
              <p className="text-sm text-gray-500">Adviser: {cls.teacher?.name || "—"}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {cls.enrollments.length} students
                </span>
                <span>{cls.scheduleSlots.length} schedule slots</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
