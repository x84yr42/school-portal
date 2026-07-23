import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@school-portal/ui";
import { Bell, AlertTriangle } from "lucide-react";
import { formatDate } from "@school-portal/shared";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: { user: true },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <Button variant="destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Emergency Broadcast
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Channels</th>
                  <th className="px-4 py-3 font-medium">Sent At</th>
                  <th className="px-4 py-3 font-medium">Read</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Badge variant="default">{notification.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{notification.title}</td>
                    <td className="px-4 py-3 text-gray-600">{notification.user.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {((notification.channels as string[]) || []).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(notification.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {notification.isRead ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
