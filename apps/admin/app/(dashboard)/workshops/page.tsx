import { prisma } from "@school-portal/database";
import { WorkshopsClient } from "@/components/workshops-client";

export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const [workshops, teachers, students] = await Promise.all([
    prisma.workshopGroup.findMany({
      include: {
        teacher: true,
        enrollments: { include: { student: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <WorkshopsClient
      workshops={workshops}
      teachers={teachers}
      students={students}
    />
  );
}
