"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, useConfirm, toast } from "@school-portal/ui";

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
  const confirm = useConfirm();
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
      toast.success(isEdit ? "Teacher updated" : "Teacher added");
      router.refresh();
      onClose();
    } else {
      toast.error("Failed to save teacher. Please try again.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!teacher) return;
    const ok = await confirm({
      title: "Delete teacher?",
      description: "This will remove the teacher account.",
      confirmText: "Delete",
    });
    if (!ok) return;
    const res = await fetch(`/api/teachers?id=${teacher.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Teacher deleted");
      router.refresh();
      onClose();
    } else {
      toast.error("Failed to delete teacher. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6"
      >
        <h3 className="text-headline text-black">
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
            Password {teacher && <span className="text-caption text-black/50">(leave blank to keep current)</span>}
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
          <div className="space-y-2 rounded-[8px] bg-[#f7f7f5] p-3">
            <p className="text-body-sm font-[480] text-black/70">Assignments</p>
            {teacher.teacherClasses.length > 0 && (
              <p className="text-caption text-black/60">
                Classes: {teacher.teacherClasses.map((c) => c.name).join(", ")}
              </p>
            )}
            {teacher.teacherWorkshops.length > 0 && (
              <p className="text-caption text-black/60">
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
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
