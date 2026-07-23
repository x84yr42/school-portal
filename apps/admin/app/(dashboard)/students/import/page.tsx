"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@school-portal/ui";
import { Download, Upload, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ImportedStudent {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
}

export default function StudentImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<{ firstName: string; lastName: string; dateOfBirth?: string; allergies?: string; medicalNotes?: string }[]>([]);
  const [importedStudents, setImportedStudents] = useState<ImportedStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function downloadTemplate() {
    const csv = "firstName,lastName,dateOfBirth,allergies,medicalNotes\nJuan,Dela Cruz,2018-05-15,,\nMaria,Santos,2019-03-20,Peanuts,";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        setError("CSV file is empty or has no data rows.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });
        if (row.firstname && row.lastname) {
          rows.push({
            firstName: row.firstname,
            lastName: row.lastname,
            dateOfBirth: row.dateofbirth || undefined,
            allergies: row.allergies || undefined,
            medicalNotes: row.medicalnotes || undefined,
          });
        }
      }
      setParsedRows(rows);
      setError("");
      setImportedStudents([]);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: parsedRows }),
    });

    if (res.ok) {
      const data = await res.json();
      setImportedStudents(data.students);
      setParsedRows([]);
    } else {
      const data = await res.json();
      setError(data.error || "Import failed");
    }
    setLoading(false);
  }

  function downloadCodes() {
    const csv = "firstName,lastName,linkCode\n" +
      importedStudents.map((s) => `${s.firstName},${s.lastName},${s.code}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-link-codes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Import Students</h2>
          <p className="text-sm text-gray-500">Upload a CSV file to bulk import students with auto-generated link codes</p>
        </div>
      </div>

      {/* Step 1: Download template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
            Download Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-600">
            Download the CSV template, fill in student details, then upload it back.
          </p>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Upload CSV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Choose CSV File
          </Button>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {parsedRows.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                {parsedRows.length} student(s) ready to import:
              </p>
              <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">First Name</th>
                      <th className="px-3 py-2 font-medium">Last Name</th>
                      <th className="px-3 py-2 font-medium">DOB</th>
                      <th className="px-3 py-2 font-medium">Allergies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1">{row.firstName}</td>
                        <td className="px-3 py-1">{row.lastName}</td>
                        <td className="px-3 py-1">{row.dateOfBirth || "—"}</td>
                        <td className="px-3 py-1">{row.allergies || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? "Importing..." : `Import ${parsedRows.length} Student(s)`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Download codes */}
      {importedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">3</span>
              Download Link Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-600">
              {importedStudents.length} student(s) imported successfully. Each has been assigned a unique link code.
              Download the codes to distribute to parents.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadCodes}>
                <FileText className="mr-2 h-4 w-4" />
                Download Codes CSV
              </Button>
              <Button variant="outline" onClick={() => router.push("/students")}>
                Back to Students
              </Button>
            </div>
            <div className="mt-4 max-h-60 overflow-y-auto rounded-md border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Link Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importedStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-1">{s.firstName} {s.lastName}</td>
                      <td className="px-3 py-1 font-mono font-bold">{s.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
