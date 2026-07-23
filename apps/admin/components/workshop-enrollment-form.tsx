"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";
import { Search, UserPlus, X } from "lucide-react";

interface WorkshopEnrollmentFormProps {
  workshops: { id: string; name: string }[];
  allStudents: { id: string; firstName: string; lastName: string }[];
  enrolledStudentIds?: string[];
  workshopId?: string;
}

export function WorkshopEnrollmentForm({
  workshops,
  allStudents,
  enrolledStudentIds = [],
  workshopId,
}: WorkshopEnrollmentFormProps) {
  const router = useRouter();
  const [selectedWorkshop, setSelectedWorkshop] = useState(workshopId ?? "");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<typeof allStudents>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<typeof allStudents>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredStudents = useCallback(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return allStudents.filter(
      (s) =>
        !enrolledStudentIds.includes(s.id) &&
        !selectedStudents.some((ss) => ss.id === s.id) &&
        (s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [search, allStudents, enrolledStudentIds, selectedStudents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const results = filteredStudents();
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, filteredStudents]);

  function addStudent(student: typeof allStudents[0]) {
    setSelectedStudents([...selectedStudents, student]);
    setSearch("");
    setShowSuggestions(false);
  }

  function removeStudent(id: string) {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== id));
  }

  async function handleEnroll() {
    if (!selectedWorkshop || selectedStudents.length === 0) return;
    setLoading(true);

    const res = await fetch("/api/workshops/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workshopGroupId: selectedWorkshop,
        studentIds: selectedStudents.map((s) => s.id),
      }),
    });

    if (res.ok) {
      setSelectedStudents([]);
      setShowConfirm(false);
      router.refresh();
    } else {
      alert("Failed to enroll students");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Enroll Students</h3>

      {!workshopId && (
        <div className="space-y-2">
          <Label htmlFor="workshop">Workshop Group</Label>
          <select
            id="workshop"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            required
          >
            <option value="">Select workshop</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Student search with autocomplete */}
      <div className="space-y-2">
        <Label>Search Students</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Type student name to search..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search && suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  onMouseDown={() => addStudent(s)}
                >
                  <span className="font-medium">{s.firstName} {s.lastName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected students */}
      {selectedStudents.length > 0 && (
        <div className="space-y-2">
          <Label>Students to Enroll ({selectedStudents.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {s.firstName} {s.lastName}
                <button type="button" onClick={() => removeStudent(s.id)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!selectedWorkshop}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Enroll {selectedStudents.length} Student(s)
          </Button>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900">Confirm Enrollment</h4>
            <p className="text-sm text-gray-600">
              Enroll {selectedStudents.length} student(s) into{" "}
              <strong>{workshops.find((w) => w.id === selectedWorkshop)?.name}</strong>?
            </p>
            <div className="max-h-40 overflow-y-auto rounded-md border border-gray-100 p-2">
              {selectedStudents.map((s) => (
                <p key={s.id} className="text-sm text-gray-700">{s.firstName} {s.lastName}</p>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleEnroll} disabled={loading}>
                {loading ? "Enrolling..." : "Confirm & Enroll"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
