import { prisma } from "@school-portal/database";
import { ActivitiesClient } from "@/components/activities-client";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await prisma.activity.findMany({
    include: {
      responses: {
        include: { student: true, parent: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const serialized = activities.map((a) => ({
    ...a,
    date: a.date?.toISOString() ?? null,
    deadline: a.deadline?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    images: (a.images as string[] | null) ?? null,
    choices: (a.choices as { id: string; label: string }[] | null) ?? null,
    responses: a.responses.map((r) => ({
      ...r,
      respondedAt: r.respondedAt.toISOString(),
    })),
  }));

  return <ActivitiesClient activities={serialized} />;
}
