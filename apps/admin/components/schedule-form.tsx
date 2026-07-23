"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";

interface ScheduleFormProps {
  classes: { id: string; name: string; grade: number }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function ScheduleForm({ classes, subjects, teachers }: ScheduleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "0",
    startTime: "",
    endTime: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        dayOfWeek: parseInt(formData.dayOfWeek),
      }),
    });

    if (res.ok) {
      setFormData({
        classId: "",
        subjectId: "",
        teacherId: "",
        dayOfWeek: "0",
        startTime: "",
        endTime: "",
      });
      router.refresh();
    } else {
      // silently fail - user can retry
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6">
      <h3 className="text-headline text-black">Add Schedule Slot</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="classId">Class</Label>
          <select
            id="classId"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            required
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Grade {c.grade})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectId">Subject</Label>
          <select
            id="subjectId"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacherId">Teacher</Label>
          <select
            id="teacherId"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dayOfWeek">Day</Label>
          <select
            id="dayOfWeek"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            required
          >
            {days.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Slot"}
      </Button>
    </form>
  );
}
