import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, Badge, Button } from "@school-portal/ui";
import { formatDate, formatCurrency, daysUntil } from "@school-portal/shared";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { responses: true },
  });

  if (!activity) {
    return (
      <div className="p-4">
        <p>Activity not found.</p>
      </div>
    );
  }

  const families = await prisma.family.findMany({
    where: { userId: session?.user?.id },
    select: { studentId: true },
  });
  const studentIds = families.map((f) => f.studentId);

  const existingResponse = activity.responses.find((r) => studentIds.includes(r.studentId));

  return (
    <div className="space-y-4 p-4 pb-24">
      <Link href="/activities" className="inline-flex items-center text-body-sm text-black/60">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to activities
      </Link>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h1 className="text-headline text-black">{activity.title}</h1>
            <Badge variant={activity.status === "ACTIVE" ? "green" : "gray"}>
              {activity.status}
            </Badge>
          </div>

          <div className="mb-4 space-y-1 text-body-sm text-black/60">
            {activity.date && <p>Date: {formatDate(activity.date)}</p>}
            {activity.location && <p>Location: {activity.location}</p>}
            {activity.cost && <p>Cost: {formatCurrency(Number(activity.cost))}</p>}
            {activity.deadline && (
              <p className={daysUntil(activity.deadline) < 0 ? "text-[#ff3d8b]" : ""}>
                Deadline: {formatDate(activity.deadline)} ({daysUntil(activity.deadline)} days left)
              </p>
            )}
          </div>

          <p className="whitespace-pre-wrap text-black/70">{activity.description}</p>

          {activity.consentRequired && !existingResponse && (
            <div className="mt-6 flex gap-3">
              <Button className="flex-1">Approve</Button>
              <Button variant="outline" className="flex-1">
                Decline
              </Button>
            </div>
          )}

          {existingResponse && (
            <div className="mt-6 rounded-[8px] bg-[#f7f7f5] p-3 text-body-sm">
              You have already {existingResponse.status.toLowerCase()} this activity.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
