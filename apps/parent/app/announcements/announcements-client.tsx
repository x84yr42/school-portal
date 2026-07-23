"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, Badge, toast } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { CheckCircle, Archive, ArchiveRestore } from "@school-portal/ui";
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
  const reduce = useReducedMotion();

  async function archiveAnnouncement(id: string) {
    // Optimistically remove, restore on failure.
    const previous = announcements;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    const res = await fetch("/api/announcements/archive", {
      method: showArchived ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });

    if (res.ok) {
      toast.success(showArchived ? "Announcement unarchived" : "Announcement archived");
    } else {
      setAnnouncements(previous);
      toast.error("Something went wrong. Please try again.");
    }
  }

  function handleDragEnd(id: string, info: PanInfo) {
    if (info.offset.x < -80) {
      archiveAnnouncement(id);
    }
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -120, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[24px]"
          >
            {/* Archive action background */}
            <div className="absolute inset-0 flex items-center justify-end bg-[#f7f7f5] px-4">
              <div className="flex items-center gap-2 text-black/60">
                <span className="text-body-sm">
                  {showArchived ? "Unarchive" : "Archive"}
                </span>
                {showArchived ? (
                  <ArchiveRestore size={20} />
                ) : (
                  <Archive size={20} />
                )}
              </div>
            </div>

            {/* Card content — draggable to archive */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.6, right: 0 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => handleDragEnd(announcement.id, info)}
              className="touch-pan-y"
            >
              <Link href={`/announcements/${announcement.id}`}>
                <Card className="transition-colors hover:bg-[#fafaf9]">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base leading-tight">
                          {announcement.title}
                        </CardTitle>
                        {announcement.hasAcknowledged && (
                          <CheckCircle size={16} className="shrink-0 text-[#1ea64a]" />
                        )}
                      </div>
                      <Badge
                        variant={announcement.priority === "EMERGENCY" ? "red" : "default"}
                        className="shrink-0"
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-caption text-black/50">
                      {formatDate(announcement.createdAt)} · {announcement.author.name}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="line-clamp-2 text-body-sm text-black/70">{announcement.body}</p>
                    {announcement.requiresAck && (
                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-caption ${
                          announcement.hasAcknowledged
                            ? "bg-[#c8e6cd] text-[#1ea64a]"
                            : "bg-[#f4ecd6] text-black"
                        }`}
                      >
                        {announcement.hasAcknowledged ? "Acknowledged" : "Requires acknowledgment"}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
