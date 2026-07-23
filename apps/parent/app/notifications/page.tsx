import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await prisma.notification.findMany({
    where: { userId: session?.user?.id },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  const serialized = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    sentAt: n.sentAt.toISOString(),
    data: n.data as Record<string, unknown> | null,
  }));

  return <NotificationsClient notifications={serialized} />;
}
