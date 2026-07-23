"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { toast, CheckCircle, ChevronRight } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import Link from "next/link";

interface HomeAnnouncement {
  id: string;
  title: string;
  createdAt: string;
}

export function HomeAnnouncements({
  announcements: initial,
}: {
  announcements: HomeAnnouncement[];
}) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initial);
  const reduce = useReducedMotion();

  async function acknowledge(id: string) {
    // Optimistically remove; restore on failure.
    const previous = announcements;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    const res = await fetch("/api/announcements/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });

    if (res.ok) {
      toast.success("Announcement acknowledged");
      router.refresh();
    } else {
      setAnnouncements(previous);
      toast.error("Something went wrong. Please try again.");
    }
  }

  function handleDragEnd(id: string, info: PanInfo) {
    // Swipe right to acknowledge.
    if (info.offset.x > 80) {
      acknowledge(id);
    }
  }

  if (announcements.length === 0) {
    return <p className="text-body-sm">You are all caught up.</p>;
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {announcements.map((announcement) => (
          <motion.div
            key={announcement.id}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 120, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[24px]"
          >
            {/* Acknowledge action background — revealed on right swipe */}
            <div className="absolute inset-0 flex items-center gap-2 bg-[#c8e6cd] px-4 text-[#1ea64a]">
              <CheckCircle size={20} />
              <span className="text-body-sm">Acknowledge</span>
            </div>

            {/* Card — drag right to acknowledge */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.6 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => handleDragEnd(announcement.id, info)}
              className="touch-pan-y"
            >
              <Link
                href={`/announcements/${announcement.id}`}
                className="flex items-center justify-between gap-3 rounded-[24px] border border-[#e6e6e6] bg-white p-4 transition-colors hover:bg-[#f7f7f5]"
              >
                <div className="min-w-0">
                  <p className="text-body-sm font-[480] truncate">{announcement.title}</p>
                  <p className="text-caption mt-1">{formatDate(announcement.createdAt)}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
