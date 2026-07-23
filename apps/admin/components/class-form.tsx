"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";

interface ClassFormProps {
  teachers: { id: string; name: string }[];
}

export function ClassForm({ teachers }: ClassFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    teacherId: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        grade: formData.grade,
        section: formData.section || null,
        teacherId: formData.teacherId || null,
      }),
    });

    if (res.ok) {
      setFormData({ name: "", grade: "", section: "", teacherId: "" });
      router.refresh();
    } else {
      // silently fail - user can retry
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6">
      <h3 className="text-headline text-black">Add Class</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            placeholder="e.g. Grade 1 - Section A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade Level</Label>
          <Input
            id="grade"
            type="number"
            min="1"
            max="12"
            placeholder="e.g. 1"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="section">Section (optional)</Label>
          <Input
            id="section"
            placeholder="e.g. A"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacherId">Class Adviser</Label>
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
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Class"}
      </Button>
    </form>
  );
}
