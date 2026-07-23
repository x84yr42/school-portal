import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge, Eyebrow } from "@school-portal/ui";
import { formatDate, formatCurrency, daysUntil } from "@school-portal/shared";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await prisma.activity.findMany({
    where: { status: "ACTIVE" },
    orderBy: { deadline: "asc" },
  });

  return (
    <div className="space-y-6 p-4 pb-24">
      <div>
        <Eyebrow className="mb-2 block">CONSENT</Eyebrow>
        <h2 className="text-display-lg text-black leading-none">Activities</h2>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`}>
            <Card className="transition-colors hover:bg-[#f7f7f5]">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{activity.title}</CardTitle>
                  <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                </div>
                <p className="text-caption mt-1">
                  {activity.date && formatDate(activity.date)} · {activity.location}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="line-clamp-2 text-body-sm">{activity.description}</p>
                <div className="mt-3 flex items-center gap-3 text-caption">
                  {activity.cost && <span>{formatCurrency(Number(activity.cost))}</span>}
                  {activity.deadline && (
                    <span className="text-[#ff3d8b]">Due in {daysUntil(activity.deadline)} days</span>
                  )}
                </div>
                {activity.consentRequired && (
                  <Badge variant="outline" className="mt-2">
                    Consent required
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
