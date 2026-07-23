"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@school-portal/ui";
import { UserPlus, GraduationCap, Palette, Pencil } from "lucide-react";
import { TeacherForm } from "@/components/teacher-form";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  teacherClasses: { id: string; name: string }[];
  teacherWorkshops: { id: string; name: string }[];
}

export function TeachersClient({ teachers: initialTeachers }: { teachers: Teacher[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  function handleEdit(teacher: Teacher) {
    setEditing(teacher);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="relative">
            <button
              onClick={() => handleEdit(teacher)}
              className="absolute right-3 top-3 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <CardHeader>
              <CardTitle className="text-lg pr-8">{teacher.name}</CardTitle>
              <p className="text-sm text-gray-500">{teacher.email}</p>
              {teacher.phone && <p className="text-xs text-gray-400">{teacher.phone}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teacher.teacherClasses.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{teacher.teacherClasses.length} class(es): {teacher.teacherClasses.map((c) => c.name).join(", ")}</span>
                  </div>
                )}
                {teacher.teacherWorkshops.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Palette className="h-4 w-4" />
                    <span>{teacher.teacherWorkshops.length} workshop(s): {teacher.teacherWorkshops.map((w) => w.name).join(", ")}</span>
                  </div>
                )}
                {teacher.teacherClasses.length === 0 && teacher.teacherWorkshops.length === 0 && (
                  <p className="text-sm text-gray-400">No assignments yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No teachers added yet. Click &quot;Add Teacher&quot; to get started.</p>
        </div>
      )}

      {showForm && (
        <TeacherForm
          teacher={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
