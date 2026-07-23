import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Badge, ColorBlock, Eyebrow } from "@school-portal/ui";
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

  const totalOutstanding = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => {
      const total = Number(i.totalAmount);
      const paid = Number(i.amountPaid ?? 0);
      return sum + (total - paid);
    }, 0);

  return (
    <div className="space-y-12">
      <div>
        <Eyebrow className="mb-2 block">BILLING & PAYMENTS</Eyebrow>
        <h2 className="text-display-lg text-black">Invoices</h2>
      </div>

      {/* Outstanding summary */}
      <ColorBlock color="cream" className="flex items-center justify-between">
        <div>
          <p className="text-caption mb-2">TOTAL OUTSTANDING</p>
          <p className="text-card-title tabular-nums">{formatCurrency(totalOutstanding)}</p>
        </div>
        <p className="text-body-sm">
          {invoices.filter((i) => i.status !== "PAID").length} unpaid invoices
        </p>
      </ColorBlock>

      <InvoiceForm
        students={students.map((s) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName }))}
        initialCategories={categories.map((c) => ({ id: c.id, name: c.name, isActive: c.isActive, sortOrder: c.sortOrder }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="text-left">
                <tr className="border-b border-[#e6e6e6]">
                  <th className="px-4 py-3 font-[480]">Invoice #</th>
                  <th className="px-4 py-3 font-[480]">Student</th>
                  <th className="px-4 py-3 font-[480]">Description</th>
                  <th className="px-4 py-3 font-[480]">Amount</th>
                  <th className="px-4 py-3 font-[480]">Due Date</th>
                  <th className="px-4 py-3 font-[480]">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-[#f1f1f1] hover:bg-[#f7f7f5]">
                    <td className="px-4 py-3 font-[480]">{invoice.number}</td>
                    <td className="px-4 py-3">
                      {invoice.student.firstName} {invoice.student.lastName}
                    </td>
                    <td className="px-4 py-3">{invoice.description}</td>
                    <td className="px-4 py-3 font-[480] tabular-nums">
                      {formatCurrency(Number(invoice.totalAmount))}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(invoice.dueDate)}
                      {isOverdue(invoice.dueDate) && invoice.status !== "PAID" && (
                        <span className="ml-2 text-[13px] text-[#ff3d8b]">Overdue</span>
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
