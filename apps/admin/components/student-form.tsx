"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  allergies: string | null;
  medicalNotes: string | null;
}

interface StudentFormProps {
  student?: Student | null;
  onClose: () => void;
}

export function StudentForm({ student, onClose }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
    phone: student?.phone ?? "",
    allergies: student?.allergies ?? "",
    medicalNotes: student?.medicalNotes ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!student;
    const res = await fetch("/api/students", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { id: student.id } : {}),
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || null,
        phone: formData.phone || null,
        allergies: formData.allergies || null,
        medicalNotes: formData.medicalNotes || null,
      }),
    });

    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      // silently fail - user can retry
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!student || !window.confirm("Delete this student? This cannot be undone.")) return;
    const res = await fetch(`/api/students?id=${student.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      // silently fail - user can retry
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6"
      >
        <h3 className="text-headline text-black">
          {student ? "Edit Student" : "Add Student"}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <textarea
            id="allergies"
            rows={2}
            className="flex w-full rounded-[8px] border border-[#e6e6e6] px-3 py-2 text-body-sm"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="e.g., Peanuts, Shellfish"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalNotes">Medical Notes</Label>
          <textarea
            id="medicalNotes"
            rows={2}
            className="flex w-full rounded-[8px] border border-[#e6e6e6] px-3 py-2 text-body-sm"
            value={formData.medicalNotes}
            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            placeholder="Any relevant medical information"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : student ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          {student && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
