import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge, ColorBlock, Eyebrow } from "@school-portal/ui";
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
    <div className="space-y-6 pb-24">
      {/* Cream header */}
      <div className="rounded-b-[24px] bg-[#f4ecd6] px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Eyebrow>BILLING</Eyebrow>
          <h2 className="text-display-lg text-black leading-none mt-2">Invoices</h2>
          <div className="mt-4">
            <p className="text-caption">TOTAL OUTSTANDING</p>
            <p className="text-card-title">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4">
        {invoices.map((invoice) => {
          const hasPendingPayment = invoice.payments.some((p) => p.status === "PENDING");
          const hasConfirmedPayment = invoice.payments.some((p) => p.status === "CONFIRMED");
          return (
            <Link key={invoice.id} href={`/billing/${invoice.id}`}>
              <Card className="transition-colors hover:bg-[#f7f7f5]">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle>{invoice.description}</CardTitle>
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
                  <p className="text-caption mt-1">
                    {invoice.student.firstName} {invoice.student.lastName}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-body-lg font-[480]">{formatCurrency(Number(invoice.totalAmount))}</span>
                    <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-caption mt-1">Due {formatDate(invoice.dueDate)}</p>
                  {isOverdue(invoice.dueDate) && invoice.status !== "PAID" && (
                    <p className="mt-2 text-caption text-[#ff3d8b]">Overdue</p>
                  )}
                  {hasPendingPayment && !hasConfirmedPayment && (
                    <p className="mt-2 text-caption">Payment pending review</p>
                  )}
                  {hasConfirmedPayment && invoice.status !== "PAID" && (
                    <p className="mt-2 text-caption text-[#1ea64a]">Partial payment confirmed</p>
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
