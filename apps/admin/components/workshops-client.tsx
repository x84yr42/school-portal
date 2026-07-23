"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@school-portal/ui";
import { Users, Pencil, Plus, Calendar } from "lucide-react";
import { WorkshopForm } from "@/components/workshop-form";
import { WorkshopEnrollmentForm } from "@/components/workshop-enrollment-form";

interface Workshop {
  id: string;
  name: string;
  description: string | null;
  teacherId: string | null;
  scheduleDay: number | null;
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
  teacher?: { id: string; name: string } | null;
  enrollments: { student: { id: string; firstName: string; lastName: string } }[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function WorkshopsClient({
  workshops: initialWorkshops,
  teachers,
  students,
}: {
  workshops: Workshop[];
  teachers: { id: string; name: string }[];
  students: { id: string; firstName: string; lastName: string }[];
}) {
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-headline text-black">Workshop Groups</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Workshop
        </Button>
      </div>

      {/* Enrollment form */}
      <WorkshopEnrollmentForm
        workshops={workshops.map((w) => ({ id: w.id, name: w.name }))}
        allStudents={students}
      />

      {/* Workshop cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workshops.map((workshop) => (
          <Card key={workshop.id} className="relative">
            <button
              onClick={() => { setEditing(workshop); setShowForm(true); }}
              className="absolute right-3 top-3 rounded p-1 text-black/40 hover:bg-[#f7f7f5] hover:text-black/60"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <CardHeader>
              <CardTitle className="text-lg pr-8">
                <Link href={`/workshops/${workshop.id}`} className="hover:underline">
                  {workshop.name}
                </Link>
              </CardTitle>
              <p className="text-body-sm text-black/50">{workshop.description || "No description"}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workshop.teacher && (
                  <p className="text-body-sm text-black/60">Teacher: {workshop.teacher.name}</p>
                )}
                {workshop.scheduleDay != null && (
                  <div className="flex items-center gap-1 text-body-sm text-black/60">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {DAYS[workshop.scheduleDay]}
                      {workshop.scheduleStartTime && ` ${workshop.scheduleStartTime}`}
                      {workshop.scheduleEndTime && ` - ${workshop.scheduleEndTime}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-body-sm text-black/60">
                  <Users className="h-4 w-4" />
                  <span>{workshop.enrollments.length} students</span>
                </div>

                {/* Expandable student list */}
                {workshop.enrollments.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedId(expandedId === workshop.id ? null : workshop.id)}
                      className="text-caption text-black hover:underline"
                    >
                      {expandedId === workshop.id ? "Hide students" : "View students"}
                    </button>
                    {expandedId === workshop.id && (
                      <div className="mt-2 space-y-1">
                        {workshop.enrollments.map((e) => (
                          <p key={e.student.id} className="text-caption text-black/50">
                            {e.student.firstName} {e.student.lastName}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workshops.length === 0 && (
        <div className="rounded-[24px] border border-[#e6e6e6] bg-white p-8 text-center">
          <p className="text-black/50">No workshops created yet.</p>
        </div>
      )}

      {showForm && (
        <WorkshopForm
          teachers={teachers}
          workshop={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
