import { prisma } from "@school-portal/database";
import { StudentsClient } from "@/components/students-client";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      include: {
        enrollments: { include: { class: true } },
        families: { include: { user: true } },
      },
      orderBy: { lastName: "asc" },
    }),
    prisma.class.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const serialized = students.map((s) => ({
    ...s,
    dateOfBirth: s.dateOfBirth?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    enrollments: s.enrollments.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
    })),
    families: s.families.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    })),
  }));

  return <StudentsClient initialStudents={serialized} classes={classes} />;
}
