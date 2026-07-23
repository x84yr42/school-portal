"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { X, Trash2, CheckCheck } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  sentAt: string;
  data: Record<string, unknown> | null;
}

export function NotificationsClient({ notifications: initial }: { notifications: Notification[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initial);

  async function dismissNotification(id: string) {
    const res = await fetch(`/api/notifications/dismiss?notificationId=${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotifications(notifications.filter((n) => n.id !== id));
    }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) {
      await fetch("/api/notifications/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: n.id }),
      });
    }
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    router.refresh();
  }

  async function clearAll() {
    if (!window.confirm("Clear all notifications?")) return;
    for (const n of notifications) {
      await fetch(`/api/notifications/dismiss?notificationId=${n.id}`, { method: "DELETE" });
    }
    setNotifications([]);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-headline text-black">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-body-sm font-[480] text-black/50">({unreadCount} unread)</span>
          )}
        </h2>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const link = notification.data?.link as string | undefined;

          const content = (
            <>
              <CardHeader className="p-4 pb-2 pr-8">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{notification.title}</CardTitle>
                  {!notification.isRead && <Badge variant="default">New</Badge>}
                </div>
                <p className="text-caption text-black/50">{formatDate(notification.sentAt)}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-body-sm text-black/70">{notification.body}</p>
              </CardContent>
            </>
          );

          return (
            <Card key={notification.id} className={`relative ${notification.isRead ? "opacity-75" : ""}`}>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="absolute right-2 top-2 rounded p-1 text-black/40 hover:bg-[#f7f7f5] hover:text-black/60"
              >
                <X className="h-3 w-3" />
              </button>
              {link ? (
                <Link href={link}>{content}</Link>
              ) : (
                <div>{content}</div>
              )}
            </Card>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="rounded-[24px] border border-[#e6e6e6] bg-white p-8 text-center">
          <p className="text-black/50">No notifications.</p>
        </div>
      )}
    </div>
  );
}
