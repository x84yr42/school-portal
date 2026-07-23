import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge, ColorBlock, Eyebrow } from "@school-portal/ui";
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
    <div className="space-y-12">
      <div>
        <Eyebrow className="mb-2 block">FAMILIES</Eyebrow>
        <h2 className="text-display-lg text-black">Parents</h2>
      </div>

      {/* Stats color blocks */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ColorBlock color="lime" className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60">
            <Users className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-caption">TOTAL PARENTS</p>
            <p className="text-card-title">{totalParents}</p>
          </div>
        </ColorBlock>
        <ColorBlock color="mint" className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60">
            <Baby className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-caption">CHILDREN LINKED</p>
            <p className="text-card-title">{totalChildren}</p>
          </div>
        </ColorBlock>
        <ColorBlock color="lilac" className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60">
            <Users className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-caption">MULTI-CHILD</p>
            <p className="text-card-title">{parentsWithMultipleChildren}</p>
          </div>
        </ColorBlock>
      </div>

      {/* Parents list */}
      <Card>
        <CardHeader>
          <CardTitle>All Parents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="text-left">
                <tr className="border-b border-[#e6e6e6]">
                  <th className="px-4 py-3 font-[480]">Parent Name</th>
                  <th className="px-4 py-3 font-[480]">Email</th>
                  <th className="px-4 py-3 font-[480]">Linked Children</th>
                  <th className="px-4 py-3 font-[480]">Registered</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr key={parent.id} className="border-b border-[#f1f1f1] hover:bg-[#f7f7f5]">
                    <td className="px-4 py-3 font-[480]">{parent.name}</td>
                    <td className="px-4 py-3">{parent.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {parent.families.length === 0 ? (
                          <span className="text-black/40">No children linked</span>
                        ) : (
                          parent.families.map((f) => (
                            <Badge key={f.id} variant="outline" className="text-[13px]">
                              {f.student.firstName} {f.student.lastName}
                              {f.student.enrollments[0]?.class?.name && (
                                <span className="ml-1 opacity-60">
                                  ({f.student.enrollments[0].class.name})
                                </span>
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(parent.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parents.length === 0 && (
            <p className="py-4 text-center text-body-sm">No parent accounts found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
