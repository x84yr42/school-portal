import { prisma } from "@school-portal/database";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate, formatCurrency } from "@school-portal/shared";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      families: { include: { user: true } },
      enrollments: { include: { class: true } },
      workshopEnrollments: { include: { workshopGroup: true } },
      invoices: { include: { payments: true }, orderBy: { dueDate: "desc" } },
      activityResponses: { include: { activity: true }, orderBy: { respondedAt: "desc" } },
      pickupContacts: true,
      linkCodes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) notFound();

  const totalPaid = student.invoices.reduce(
    (sum, inv) => sum + inv.payments.reduce((s, p) => s + (p.status === "CONFIRMED" ? p.amount : 0), 0),
    0
  );
  const totalDue = student.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-sm text-gray-500">Student Profile</p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-gray-900">{student.firstName} {student.lastName}</p>
            </div>
            {student.dateOfBirth && (
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-gray-900">{formatDate(student.dateOfBirth)}</p>
              </div>
            )}
            {student.phone && (
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Number</p>
                <p className="text-gray-900">{student.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={student.isActive ? "green" : "gray"}>
                {student.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {student.allergies && (
              <div>
                <p className="text-sm font-medium text-gray-500">Allergies</p>
                <p className="text-red-600">{student.allergies}</p>
              </div>
            )}
            {student.medicalNotes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Medical Notes</p>
                <p className="text-gray-900">{student.medicalNotes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parents / Guardians */}
      <Card>
        <CardHeader>
          <CardTitle>Parents / Guardians</CardTitle>
        </CardHeader>
        <CardContent>
          {student.families.length > 0 ? (
            <div className="space-y-3">
              {student.families.map((family) => (
                <div key={family.id} className="flex items-center justify-between rounded-md border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{family.user.name}</p>
                    <p className="text-sm text-gray-500">{family.relationship}</p>
                    {family.user.email && <p className="text-xs text-gray-400">{family.user.email}</p>}
                    {family.user.phone && <p className="text-xs text-gray-400">{family.user.phone}</p>}
                  </div>
                  {family.isPrimary && <Badge variant="green">Primary</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No parents/guardians linked yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Class Enrollment */}
      <Card>
        <CardHeader>
          <CardTitle>Class Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          {student.enrollments.length > 0 ? (
            <div className="space-y-2">
              {student.enrollments.map((e) => (
                <div key={e.id} className="rounded-md border border-gray-100 p-3">
                  <p className="font-medium text-gray-900">{e.class.name}</p>
                  <p className="text-sm text-gray-500">
                    Enrolled: {formatDate(e.startDate)}
                    {e.endDate && ` - End: ${formatDate(e.endDate)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Not enrolled in any class.</p>
          )}
        </CardContent>
      </Card>

      {/* Workshop Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Workshop Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {student.workshopEnrollments.length > 0 ? (
            <div className="space-y-2">
              {student.workshopEnrollments.map((e) => (
                <div key={e.id} className="rounded-md border border-gray-100 p-3">
                  <p className="font-medium text-gray-900">{e.workshopGroup.name}</p>
                  <p className="text-sm text-gray-500">
                    Enrolled: {formatDate(e.startDate)}
                    {e.endDate && ` - End: ${formatDate(e.endDate)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Not enrolled in any workshops.</p>
          )}
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Billed</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalDue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Paid</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalDue - totalPaid)}</p>
            </div>
          </div>
          {student.invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">Invoice #</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Due Date</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {student.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-4 py-2 font-medium text-gray-900">{inv.number}</td>
                      <td className="px-4 py-2">{formatCurrency(Number(inv.totalAmount))}</td>
                      <td className="px-4 py-2">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={inv.status === "PAID" ? "green" : inv.status === "OVERDUE" ? "red" : "gray"}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No invoices.</p>
          )}
        </CardContent>
      </Card>

      {/* Activity Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {student.activityResponses.length > 0 ? (
            <div className="space-y-2">
              {student.activityResponses.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{r.activity.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(r.respondedAt)}</p>
                  </div>
                  <Badge variant={r.status === "APPROVED" ? "green" : "red"}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No activity responses.</p>
          )}
        </CardContent>
      </Card>

      {/* Link Codes */}
      {student.linkCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parent Link Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.linkCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between rounded-md border border-gray-100 p-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-gray-900">{code.code}</p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(code.createdAt)}
                      {code.expiresAt && ` · Expires: ${formatDate(code.expiresAt)}`}
                    </p>
                  </div>
                  <Badge variant={code.isUsed ? "gray" : "green"}>
                    {code.isUsed ? "Used" : "Available"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
