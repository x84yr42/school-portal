import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@school-portal/ui";
import { CalendarCheck } from "lucide-react";
import { formatDate, formatCurrency } from "@school-portal/shared";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await prisma.activity.findMany({
    include: { responses: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Activities & Consent</h2>
        <Button>
          <CalendarCheck className="mr-2 h-4 w-4" />
          Create Activity
        </Button>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {activity.date && formatDate(activity.date)} · {activity.location}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === "ACTIVE"
                      ? "green"
                      : activity.status === "DRAFT"
                      ? "gray"
                      : "default"
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-gray-600">{activity.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>Responses: {activity.responses.length}</span>
                {activity.cost && <span>Cost: {formatCurrency(Number(activity.cost))}</span>}
                {activity.deadline && <span>Deadline: {formatDate(activity.deadline)}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
