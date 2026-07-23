"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@school-portal/ui";

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

interface WorkshopFormProps {
  teachers: { id: string; name: string }[];
  workshop?: Workshop | null;
  onClose: () => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function WorkshopForm({ teachers, workshop, onClose }: WorkshopFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: workshop?.name ?? "",
    description: workshop?.description ?? "",
    teacherId: workshop?.teacherId ?? "",
    scheduleDay: workshop?.scheduleDay?.toString() ?? "",
    scheduleStartTime: workshop?.scheduleStartTime ?? "",
    scheduleEndTime: workshop?.scheduleEndTime ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!workshop;
    const res = await fetch("/api/workshops", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { id: workshop.id } : {}),
        name: formData.name,
        description: formData.description || null,
        teacherId: formData.teacherId || null,
        scheduleDay: formData.scheduleDay || null,
        scheduleStartTime: formData.scheduleStartTime || null,
        scheduleEndTime: formData.scheduleEndTime || null,
      }),
    });

    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save workshop");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!workshop || !confirm("Delete this workshop?")) return;
    const res = await fetch(`/api/workshops?id=${workshop.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      alert("Failed to delete workshop");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {workshop ? "Edit Workshop" : "Add Workshop"}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="name">Workshop Name</Label>
          <Input
            id="name"
            placeholder="e.g. Art Workshop, Science Club"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the workshop"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacherId">Assigned Teacher</Label>
          <select
            id="teacherId"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
          >
            <option value="">No teacher assigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="scheduleDay">Day</Label>
            <select
              id="scheduleDay"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={formData.scheduleDay}
              onChange={(e) => setFormData({ ...formData, scheduleDay: e.target.value })}
            >
              <option value="">Select a day</option>
              {DAYS.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduleStartTime">Start</Label>
            <Input
              id="scheduleStartTime"
              type="time"
              value={formData.scheduleStartTime}
              onChange={(e) => setFormData({ ...formData, scheduleStartTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduleEndTime">End</Label>
            <Input
              id="scheduleEndTime"
              type="time"
              value={formData.scheduleEndTime}
              onChange={(e) => setFormData({ ...formData, scheduleEndTime: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : workshop ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          {workshop && (
            <Button type="button" variant="outline" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
