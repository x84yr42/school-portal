import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge, Eyebrow } from "@school-portal/ui";
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
    <div className="space-y-12">
      <div>
        <Eyebrow className="mb-2 block">ACADEMICS</Eyebrow>
        <h2 className="text-display-lg text-black">Classes & Grades</h2>
      </div>

      <ClassForm teachers={teachers.map((t) => ({ id: t.id, name: t.name }))} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{cls.name}</CardTitle>
                <Badge>Grade {cls.grade}</Badge>
              </div>
              <p className="text-body-sm">Adviser: {cls.teacher?.name || "N/A"}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-body-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" strokeWidth={1.5} />
                  {cls.enrollments.length} students
                </span>
                <span>{cls.scheduleSlots.length} slots</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
