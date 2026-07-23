import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Eyebrow } from "@school-portal/ui";
import { AlertTriangle } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: { user: true },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow className="mb-2 block">COMMUNICATIONS</Eyebrow>
          <h2 className="text-display-lg text-black">Notifications</h2>
        </div>
        <Button variant="magenta">
          <AlertTriangle size={20} />
          Emergency Broadcast
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="text-left">
                <tr className="border-b border-[#e6e6e6]">
                  <th className="px-4 py-3 font-[480]">Type</th>
                  <th className="px-4 py-3 font-[480]">Title</th>
                  <th className="px-4 py-3 font-[480]">Recipient</th>
                  <th className="px-4 py-3 font-[480]">Channels</th>
                  <th className="px-4 py-3 font-[480]">Sent At</th>
                  <th className="px-4 py-3 font-[480]">Read</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id} className="border-b border-[#f1f1f1] hover:bg-[#f7f7f5]">
                    <td className="px-4 py-3">
                      <Badge variant="default">{notification.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-[480]">{notification.title}</td>
                    <td className="px-4 py-3">{notification.user.name}</td>
                    <td className="px-4 py-3">
                      {((notification.channels as string[]) || []).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(notification.sentAt)}
                    </td>
                    <td className="px-4 py-3">
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
