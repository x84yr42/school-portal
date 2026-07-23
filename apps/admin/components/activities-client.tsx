"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@school-portal/ui";
import { CalendarCheck, Plus, Pencil, BarChart3, CheckCircle, XCircle, Clock } from "lucide-react";
import { ActivityForm } from "@/components/activity-form";

interface ActivityResponse {
  id: string;
  status: string;
  student: { firstName: string; lastName: string };
  parent: { name: string };
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string | null;
  location: string | null;
  images: string[] | null;
  participationType: string;
  consentRequired: boolean;
  choices: { id: string; label: string }[] | null;
  cost: number | null;
  capacity: number | null;
  deadline: string | null;
  status: string;
  responses: ActivityResponse[];
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function ActivitiesClient({ activities: initialActivities, totalStudents }: { activities: Activity[]; totalStudents: number }) {
  const [activities, setActivities] = useState(initialActivities);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-headline text-black">Activities & Consent</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <CalendarCheck className="mr-2 h-4 w-4" />
          Create Activity
        </Button>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => {
          const approved = activity.responses.filter((r) => r.status === "APPROVED").length;
          const declined = activity.responses.filter((r) => r.status === "DECLINED").length;
          const total = activity.responses.length;
          const isExpanded = expandedId === activity.id;

          return (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <Badge
                        variant={
                          activity.status === "ACTIVE" ? "green" :
                          activity.status === "DRAFT" ? "gray" :
                          activity.status === "CLOSED" ? "default" : "red"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-caption text-black/50">
                      {activity.date && formatDate(activity.date)}
                      {activity.location && ` · ${activity.location}`}
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditing(activity); setShowForm(true); }}
                    className="rounded p-1 text-black/40 hover:bg-[#f7f7f5] hover:text-black/60"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-body-sm text-black/60">{activity.description}</p>

                {/* Metrics */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-body-sm">
                  <div className="flex items-center gap-1 text-black/50">
                    <BarChart3 className="h-4 w-4" />
                    <span className="tabular-nums">{total} response(s) ({totalStudents > 0 ? Math.round((total / totalStudents) * 100) : 0}%)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1ea64a]">
                    <CheckCircle className="h-4 w-4" />
                    <span className="tabular-nums">{approved} approved</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#ff3d8b]">
                    <XCircle className="h-4 w-4" />
                    <span className="tabular-nums">{declined} declined</span>
                  </div>
                  {activity.cost && (
                    <span className="text-black/50 tabular-nums">Cost: ₱{Number(activity.cost).toLocaleString()}</span>
                  )}
                  {activity.deadline && (
                    <span className="text-black/50">Deadline: {formatDate(activity.deadline)}</span>
                  )}
                </div>

                {/* Expandable response details */}
                {total > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                      className="text-caption text-black hover:underline"
                    >
                      {isExpanded ? "Hide details" : "View response details"}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-[8px] border border-[#f1f1f1]">
                        <table className="w-full text-body-sm">
                          <thead className="bg-[#f7f7f5] text-left text-black/60">
                            <tr>
                              <th className="px-3 py-2 font-[480]">Student</th>
                              <th className="px-3 py-2 font-[480]">Parent</th>
                              <th className="px-3 py-2 font-[480]">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f1f1]">
                            {activity.responses.map((r) => (
                              <tr key={r.id}>
                                <td className="px-3 py-1">{r.student.firstName} {r.student.lastName}</td>
                                <td className="px-3 py-1">{r.parent.name}</td>
                                <td className="px-3 py-1">
                                  <Badge variant={r.status === "APPROVED" ? "green" : "red"}>
                                    {r.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Choices display */}
                {activity.choices && activity.choices.length > 0 && (
                  <div className="mt-3">
                    <p className="text-caption text-black/50">Choices:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activity.choices.map((c) => (
                        <span key={c.id} className="rounded-full bg-[#f1f1f1] px-2 py-0.5 text-caption text-black/60">
                          {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="rounded-[24px] border border-[#e6e6e6] bg-white p-8 text-center">
          <p className="text-black/50">No activities created yet.</p>
        </div>
      )}

      {showForm && (
        <ActivityForm
          activity={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
