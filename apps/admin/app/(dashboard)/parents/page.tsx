import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { Users, Baby } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ParentsPage() {
  const parents = await prisma.user.findMany({
    where: { role: "PARENT" },
    include: {
      families: {
        include: {
          student: {
            include: {
              enrollments: { include: { class: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalParents = parents.length;
  const totalChildren = parents.reduce((sum, p) => sum + p.families.length, 0);
  const parentsWithMultipleChildren = parents.filter((p) => p.families.length > 1).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Parents</h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Parents</p>
                <p className="text-2xl font-bold">{totalParents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Baby className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Children Linked</p>
                <p className="text-2xl font-bold">{totalChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Multiple Children</p>
                <p className="text-2xl font-bold">{parentsWithMultipleChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parents list */}
      <Card>
        <CardHeader>
          <CardTitle>All Parents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Parent Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Linked Children</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{parent.name}</td>
                    <td className="px-4 py-3 text-gray-600">{parent.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {parent.families.length === 0 ? (
                          <span className="text-gray-400">No children linked</span>
                        ) : (
                          parent.families.map((f) => (
                            <Badge key={f.id} variant="default" className="text-xs">
                              {f.student.firstName} {f.student.lastName}
                              {f.student.enrollments[0]?.class?.name && (
                                <span className="ml-1 text-gray-500">
                                  ({f.student.enrollments[0].class.name})
                                </span>
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(parent.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parents.length === 0 && (
            <p className="py-4 text-center text-gray-500">No parent accounts found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
