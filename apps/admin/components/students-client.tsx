"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@school-portal/ui";
import { UserPlus, Search, Download, Filter, ArrowUpDown } from "lucide-react";
import { StudentForm } from "@/components/student-form";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  createdAt: string;
  enrollments: { class: { name: string } | null }[];
  families: { user: { name: string } }[];
}

type SortField = "lastName" | "firstName" | "class" | "parents" | "createdAt";
type SortDir = "asc" | "desc";

export function StudentsClient({
  initialStudents,
  classes,
}: {
  initialStudents: Student[];
  classes: { id: string; name: string }[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [filterClass, setFilterClass] = useState("");
  const [sortField, setSortField] = useState<SortField>("lastName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const filteredAndSorted = useMemo(() => {
    let result = [...students];

    // Filter by class
    if (filterClass) {
      result = result.filter(
        (s) => s.enrollments[0]?.class?.name === filterClass
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "lastName":
          cmp = a.lastName.localeCompare(b.lastName);
          break;
        case "firstName":
          cmp = a.firstName.localeCompare(b.firstName);
          break;
        case "class":
          cmp = (a.enrollments[0]?.class?.name ?? "").localeCompare(
            b.enrollments[0]?.class?.name ?? ""
          );
          break;
        case "parents":
          cmp = (a.families[0]?.user?.name ?? "").localeCompare(
            b.families[0]?.user?.name ?? ""
          );
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [students, filterClass, sortField, sortDir]);

  function handleEdit(student: Student) {
    setEditing(student);
    setShowForm(true);
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    return (
      <th
        className="cursor-pointer px-4 py-3 font-medium select-none hover:bg-gray-100"
        onClick={() => toggleSort(field)}
      >
        <div className="flex items-center gap-1">
          {label}
          <ArrowUpDown className="h-3 w-3 text-gray-400" />
          {sortField === field && (
            <span className="text-xs text-blue-600">{sortDir === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
      </th>
    );
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

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter:</span>
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="lastName">Last Name</option>
            <option value="firstName">First Name</option>
            <option value="class">Class</option>
            <option value="parents">Parent</option>
            <option value="createdAt">Date Added</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {sortDir === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Students
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredAndSorted.length} of {students.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <SortHeader field="lastName" label="Name" />
                  <SortHeader field="class" label="Class" />
                  <SortHeader field="parents" label="Parents" />
                  <th className="px-4 py-3 font-medium">Allergies</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSorted.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/students/${student.id}`} className="font-medium text-blue-600 hover:underline">
                        {student.firstName} {student.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.enrollments[0]?.class?.name ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.families.map((f) => f.user.name).join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-black">{student.allergies || "None"}</td>
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
          {filteredAndSorted.length === 0 && (
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
