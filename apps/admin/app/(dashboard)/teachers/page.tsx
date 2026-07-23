import { prisma } from "@school-portal/database";
import { TeachersClient } from "@/components/teachers-client";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: {
      teacherClasses: true,
      teacherWorkshops: true,
    },
    orderBy: { name: "asc" },
  });

  return <TeachersClient teachers={teachers} />;
}
