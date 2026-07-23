"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { AnnouncementForm } from "@/components/announcement-form";
import {
  Pencil, Trash2, CheckCircle, XCircle, Eye, BarChart3, Users,
} from "lucide-react";

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
  const [announcements, setAnnouncements] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete announcement");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
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
                    <p className="mt-1 text-sm text-gray-500">
                      By {announcement.author.name} · {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="View metrics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-gray-600">{announcement.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  {target && (
                    <Badge variant="gray">
                      {target.type}: {target.value}
                    </Badge>
                  )}
                  {announcement.requiresAck && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                      Requires Acknowledgment
                    </span>
                  )}
                </div>

                {/* Metrics panel */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Engagement Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-md bg-white p-3 text-center shadow-sm">
                        <Users className="mx-auto h-5 w-5 text-blue-500" />
                        <p className="mt-1 text-lg font-bold text-gray-900">{m.totalParents}</p>
                        <p className="text-xs text-gray-500">Total Parents</p>
                      </div>
                      <div className="rounded-md bg-white p-3 text-center shadow-sm">
                        <Eye className="mx-auto h-5 w-5 text-indigo-500" />
                        <p className="mt-1 text-lg font-bold text-gray-900">{m.totalReads}</p>
                        <p className="text-xs text-gray-500">Read ({m.responseRate}%)</p>
                      </div>
                      {announcement.requiresAck && (
                        <>
                          <div className="rounded-md bg-white p-3 text-center shadow-sm">
                            <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                            <p className="mt-1 text-lg font-bold text-green-700">{m.acknowledged}</p>
                            <p className="text-xs text-gray-500">Acknowledged {m.ackRate !== null ? `(${m.ackRate}%)` : ""}</p>
                          </div>
                          <div className="rounded-md bg-white p-3 text-center shadow-sm">
                            <XCircle className="mx-auto h-5 w-5 text-red-500" />
                            <p className="mt-1 text-lg font-bold text-red-700">{m.notAcknowledged}</p>
                            <p className="text-xs text-gray-500">Not Yet</p>
                          </div>
                        </>
                      )}
                    </div>
                    {announcement.requiresAck && m.ackRate !== null && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Acknowledgment Progress</span>
                          <span>{m.ackRate}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-green-500 transition-all"
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
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No announcements yet.</p>
        </div>
      )}
    </div>
  );
}
