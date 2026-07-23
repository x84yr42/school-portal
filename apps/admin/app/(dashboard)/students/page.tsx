import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@school-portal/ui";
import { UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      enrollments: { include: { class: true } },
      families: { include: { user: true } },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.enrollments[0]?.class?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.families.map((f) => f.user.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.allergies || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
