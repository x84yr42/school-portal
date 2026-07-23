"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { CheckCircle, Archive, ArchiveRestore } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
  requiresAck: boolean;
  author: { name: string };
  hasAcknowledged: boolean;
}

export function AnnouncementsClient({
  announcements: initial,
  showArchived = false,
}: {
  announcements: Announcement[];
  showArchived?: boolean;
}) {
  const [announcements, setAnnouncements] = useState(initial);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  async function archiveAnnouncement(id: string) {
    const res = await fetch("/api/announcements/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });
    if (res.ok) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  }

  async function unarchiveAnnouncement(id: string) {
    const res = await fetch("/api/announcements/archive", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });
    if (res.ok) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  }

  function handleTouchStart(e: React.TouchEvent, id: string) {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setSwipedId(id);
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchCurrentX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(id: string) {
    const diff = touchCurrentX.current - touchStartX.current;
    if (diff < -80) {
      // Swiped left - archive/unarchive
      if (showArchived) {
        unarchiveAnnouncement(id);
      } else {
        archiveAnnouncement(id);
      }
    }
    setSwipedId(null);
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => {
        const isSwiped = swipedId === announcement.id;
        return (
          <div
            key={announcement.id}
            className="relative overflow-hidden rounded-lg"
            onTouchStart={(e) => handleTouchStart(e, announcement.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(announcement.id)}
          >
            {/* Archive action background */}
            <div className="absolute inset-0 flex items-center justify-end bg-gray-100 px-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm">
                  {showArchived ? "Unarchive" : "Archive"}
                </span>
                {showArchived ? (
                  <ArchiveRestore className="h-5 w-5" />
                ) : (
                  <Archive className="h-5 w-5" />
                )}
              </div>
            </div>

            {/* Card content */}
            <Link href={`/announcements/${announcement.id}`}>
              <Card
                className={`transition-colors hover:bg-gray-50 transition-transform duration-200 ${
                  isSwiped ? "-translate-x-20" : "translate-x-0"
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base leading-tight">
                        {announcement.title}
                      </CardTitle>
                      {announcement.hasAcknowledged && (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      )}
                    </div>
                    <Badge
                      variant={announcement.priority === "EMERGENCY" ? "red" : "default"}
                      className="shrink-0"
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(announcement.createdAt)} · {announcement.author.name}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="line-clamp-2 text-sm text-gray-700">{announcement.body}</p>
                  {announcement.requiresAck && (
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                        announcement.hasAcknowledged
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {announcement.hasAcknowledged ? "Acknowledged" : "Requires acknowledgment"}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
