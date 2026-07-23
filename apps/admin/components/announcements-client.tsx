"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, useConfirm, toast } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { AnnouncementForm } from "@/components/announcement-form";
import {
  Pencil, Trash2, CheckCircle, XCircle, Eye, BarChart, Users,
} from "@school-portal/ui";

interface Metrics {
  totalParents: number;
  totalReads: number;
  acknowledged: number;
  notAcknowledged: number;
  responseRate: number;
  ackRate: number | null;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  targetAudience: string | null;
  requiresAck: boolean;
  isPublished: boolean;
  createdAt: string;
  publishedAt: string | null;
  author: { name: string };
  metrics: Metrics;
}

interface AnnouncementsClientProps {
  announcements: Announcement[];
  classes: { id: string; name: string; grade: number }[];
  workshops: { id: string; name: string }[];
  userId: string;
}

export function AnnouncementsClient({ announcements: initial, classes, workshops, userId }: AnnouncementsClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [announcements, setAnnouncements] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete announcement?",
      description: "This will permanently remove the announcement for all parents.",
      confirmText: "Delete",
    });
    if (!ok) return;
    const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
      toast.success("Announcement deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete announcement");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-headline text-black">Announcements</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {showForm && (
        <AnnouncementForm
          classes={classes}
          workshops={workshops}
          userId={userId}
        />
      )}

      <div className="grid gap-4">
        {announcements.map((announcement) => {
          const target = announcement.targetAudience ? JSON.parse(announcement.targetAudience) : null;
          const isExpanded = expandedId === announcement.id;
          const m = announcement.metrics;

          return (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <Badge variant={announcement.priority === "EMERGENCY" ? "red" : "default"}>
                        {announcement.priority}
                      </Badge>
                      <Badge variant={announcement.isPublished ? "green" : "gray"}>
                        {announcement.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-body-sm text-black/50">
                      By {announcement.author.name} · {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                      className="rounded-[8px] p-1 text-black/30 hover:bg-[#f7f7f5] hover:text-black/60 transition-colors"
                      title="View metrics"
                    >
                      <BarChart size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="rounded-[8px] p-1 text-black/30 hover:bg-[#efd4d4] hover:text-black transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-black/60">{announcement.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-body-sm text-black/50">
                  {target && (
                    <Badge variant="gray">
                      {target.type}: {target.value}
                    </Badge>
                  )}
                  {announcement.requiresAck && (
                    <span className="rounded-full bg-[#f4ecd6] px-2 py-0.5 text-caption text-black">
                      Requires Acknowledgment
                    </span>
                  )}
                </div>

                {/* Metrics panel */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 rounded-[24px] border border-[#e6e6e6] bg-[#f7f7f5] p-4">
                    <h4 className="text-body-sm font-[480] text-black flex items-center gap-2">
                      <BarChart size={16} />
                      Engagement Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-[8px] bg-white p-3 text-center">
                        <Users className="mx-auto h-5 w-5 text-black/50" />
                        <p className="mt-1 text-headline text-black tabular-nums">{m.totalParents}</p>
                        <p className="text-caption">Total Parents</p>
                      </div>
                      <div className="rounded-[8px] bg-white p-3 text-center">
                        <Eye className="mx-auto h-5 w-5 text-black/50" />
                        <p className="mt-1 text-headline text-black tabular-nums">{m.totalReads}</p>
                        <p className="text-caption">Read ({m.responseRate}%)</p>
                      </div>
                      {announcement.requiresAck && (
                        <>
                          <div className="rounded-[8px] bg-white p-3 text-center">
                            <CheckCircle className="mx-auto h-5 w-5 text-[#1ea64a]" />
                            <p className="mt-1 text-headline text-[#1ea64a] tabular-nums">{m.acknowledged}</p>
                            <p className="text-caption">Acknowledged {m.ackRate !== null ? `(${m.ackRate}%)` : ""}</p>
                          </div>
                          <div className="rounded-[8px] bg-white p-3 text-center">
                            <XCircle className="mx-auto h-5 w-5 text-black/50" />
                            <p className="mt-1 text-headline text-black tabular-nums">{m.notAcknowledged}</p>
                            <p className="text-caption">Not Yet</p>
                          </div>
                        </>
                      )}
                    </div>
                    {announcement.requiresAck && m.ackRate !== null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-caption text-black/50">
                          <span>Acknowledgment Progress</span>
                          <span className="tabular-nums">{m.ackRate}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-[#e6e6e6]">
                          <div
                            className="h-2 rounded-full bg-[#1ea64a] transition-all"
                            style={{ width: `${m.ackRate}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {announcements.length === 0 && (
        <div className="rounded-[24px] border border-[#e6e6e6] bg-white p-8 text-center">
          <p className="text-body-sm text-black/50">No announcements yet.</p>
        </div>
      )}
    </div>
  );
}
