"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  teacherClasses: { id: string; name: string }[];
  teacherWorkshops: { id: string; name: string }[];
}

interface TeacherFormProps {
  teacher?: Teacher | null;
  onClose: () => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function TeacherForm({ teacher, onClose }: TeacherFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: teacher?.name ?? "",
    email: teacher?.email ?? "",
    phone: teacher?.phone ?? "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!teacher;
    const res = await fetch("/api/teachers", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { id: teacher.id } : {}),
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        ...(!isEdit || formData.password ? { password: formData.password } : {}),
      }),
    });

    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save teacher");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!teacher || !confirm("Delete this teacher?")) return;
    const res = await fetch(`/api/teachers?id=${teacher.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      alert("Failed to delete teacher");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {teacher ? "Edit Teacher" : "Add Teacher"}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password {teacher && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!teacher}
          />
        </div>

        {teacher && (teacher.teacherClasses.length > 0 || teacher.teacherWorkshops.length > 0) && (
          <div className="space-y-2 rounded-md bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">Assignments</p>
            {teacher.teacherClasses.length > 0 && (
              <p className="text-xs text-gray-600">
                Classes: {teacher.teacherClasses.map((c) => c.name).join(", ")}
              </p>
            )}
            {teacher.teacherWorkshops.length > 0 && (
              <p className="text-xs text-gray-600">
                Workshops: {teacher.teacherWorkshops.map((w) => w.name).join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : teacher ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          {teacher && (
            <Button type="button" variant="outline" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
