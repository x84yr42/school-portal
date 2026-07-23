import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
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
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Activities & Consent</h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`}>
            <Card className="transition-colors hover:bg-gray-50">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{activity.title}</CardTitle>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  {activity.date && formatDate(activity.date)} · {activity.location}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="line-clamp-2 text-sm text-gray-700">{activity.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  {activity.cost && <span>{formatCurrency(Number(activity.cost))}</span>}
                  {activity.deadline && (
                    <span className="text-red-600">Due in {daysUntil(activity.deadline)} days</span>
                  )}
                </div>
                {activity.consentRequired && (
                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                    Consent required
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
