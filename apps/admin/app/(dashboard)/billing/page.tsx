import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate, formatCurrency, isOverdue } from "@school-portal/shared";
import { InvoiceForm } from "@/components/invoice-form";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const [invoices, students, categories] = await Promise.all([
    prisma.invoice.findMany({
      include: { student: true, payments: true },
      orderBy: { dueDate: "desc" },
    }),
    prisma.student.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.invoiceCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "green";
      case "OVERDUE":
        return "red";
      case "PARTIALLY_PAID":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>

      <InvoiceForm
        students={students.map((s) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName }))}
        initialCategories={categories.map((c) => ({ id: c.id, name: c.name, isActive: c.isActive, sortOrder: c.sortOrder }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{invoice.number}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {invoice.student.firstName} {invoice.student.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{invoice.description}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatCurrency(Number(invoice.totalAmount))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(invoice.dueDate)}
                      {isOverdue(invoice.dueDate) && invoice.status !== "PAID" && (
                        <span className="ml-2 text-xs text-red-600">Overdue</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                    </td>
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
