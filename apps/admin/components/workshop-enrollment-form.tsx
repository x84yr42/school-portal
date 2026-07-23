"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label } from "@school-portal/ui";

interface WorkshopEnrollmentFormProps {
  workshops: { id: string; name: string }[];
  students: { id: string; firstName: string; lastName: string }[];
}

export function WorkshopEnrollmentForm({ workshops, students }: WorkshopEnrollmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workshopId, setWorkshopId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workshopId || selectedStudents.length === 0) {
      alert("Please select a workshop and at least one student");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/workshops/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId, studentIds: selectedStudents }),
    });

    if (res.ok) {
      setSelectedStudents([]);
      setWorkshopId("");
      router.refresh();
    } else {
      alert("Failed to enroll students");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Enroll Students in Workshop</h3>

      <div className="space-y-2">
        <Label htmlFor="workshopId">Workshop Group</Label>
        <select
          id="workshopId"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          value={workshopId}
          onChange={(e) => setWorkshopId(e.target.value)}
          required
        >
          <option value="">Select workshop</option>
          {workshops.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Students</Label>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-3">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedStudents.includes(s.id)}
                onChange={() => toggleStudent(s.id)}
                className="h-4 w-4 rounded border-gray-300"
              />
              {s.lastName}, {s.firstName}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Enrolling..." : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`}
      </Button>
    </form>
  );
}
