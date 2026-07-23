import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await prisma.notification.findMany({
    where: { userId: session?.user?.id },
    orderBy: { sentAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Notifications</h2>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.isRead ? "opacity-75" : ""}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">{notification.title}</CardTitle>
                {!notification.isRead && <Badge variant="default">New</Badge>}
              </div>
              <p className="text-xs text-gray-500">{formatDate(notification.sentAt)}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-700">{notification.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
