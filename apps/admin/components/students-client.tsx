"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@school-portal/ui";
import { UserPlus, Search, Download } from "lucide-react";
import { StudentForm } from "@/components/student-form";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  enrollments: { class: { name: string } | null }[];
  families: { user: { name: string } }[];
}

export function StudentsClient({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const res = await fetch(`/api/students?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(search), 200);
    return () => clearTimeout(timer);
  }, [search, fetchSuggestions]);

  function handleEdit(student: Student) {
    setEditing(student);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <div className="flex gap-2">
          <Link href="/students/import">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </Link>
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search bar with autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search students by name..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search && suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </div>
        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={`/students/${s.id}`}
                className="block px-4 py-2 text-sm hover:bg-gray-50"
                onMouseDown={() => { setSearch(""); setShowSuggestions(false); }}
              >
                <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                <span className="ml-2 text-gray-500">
                  {s.enrollments[0]?.class?.name ?? "No class"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Parents</th>
                  <th className="px-4 py-3 font-medium">Allergies</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/students/${student.id}`} className="font-medium text-blue-600 hover:underline">
                        {student.firstName} {student.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.enrollments[0]?.class?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.families.map((f) => f.user.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.allergies || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <p className="py-4 text-center text-gray-500">No students found.</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <StudentForm
          student={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
