import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate, formatCurrency, isOverdue } from "@school-portal/shared";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await auth();
  const families = await prisma.family.findMany({
    where: { userId: session?.user?.id },
    select: { studentId: true },
  });
  const studentIds = families.map((f) => f.studentId);

  const invoices = await prisma.invoice.findMany({
    where: { studentId: { in: studentIds } },
    include: { student: true, payments: true },
    orderBy: { dueDate: "desc" },
  });

  const totalOutstanding = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + Number(i.totalAmount) - Number(i.amountPaid), 0);

  return (
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Billing</h2>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {invoices.map((invoice) => {
          const hasPendingPayment = invoice.payments.some((p) => p.status === "PENDING");
          const hasConfirmedPayment = invoice.payments.some((p) => p.status === "CONFIRMED");
          return (
            <Link key={invoice.id} href={`/billing/${invoice.id}`}>
              <Card className="transition-colors hover:bg-gray-50">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{invoice.description}</CardTitle>
                    <Badge
                      variant={
                        invoice.status === "PAID"
                          ? "green"
                          : invoice.status === "OVERDUE"
                            ? "red"
                            : "gray"
                      }
                    >
                      {invoice.status === "PAID"
                        ? "Paid"
                        : invoice.status === "OVERDUE"
                          ? "Overdue"
                          : invoice.status === "PARTIALLY_PAID"
                            ? "Partially Paid"
                            : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {invoice.student.firstName} {invoice.student.lastName}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{formatCurrency(Number(invoice.totalAmount))}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">Due {formatDate(invoice.dueDate)}</p>
                  {isOverdue(invoice.dueDate) && invoice.status !== "PAID" && (
                    <p className="mt-2 text-xs text-red-600">Overdue</p>
                  )}
                  {hasPendingPayment && !hasConfirmedPayment && (
                    <p className="mt-2 text-xs text-yellow-600">Payment pending review</p>
                  )}
                  {hasConfirmedPayment && invoice.status !== "PAID" && (
                    <p className="mt-2 text-xs text-green-600">Partial payment confirmed</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
