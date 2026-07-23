import { prisma } from "@school-portal/database";
import { Card, CardContent, Badge } from "@school-portal/ui";
import { formatDate, formatCurrency, isOverdue } from "@school-portal/shared";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { student: true, payments: { orderBy: { recordedAt: "desc" } } },
  });

  if (!invoice) {
    return (
      <div className="p-4">
        <p>Invoice not found.</p>
      </div>
    );
  }

  const lineItems = (invoice.lineItems as { description: string; amount: number }[]) || [];
  const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid);

  return (
    <div className="space-y-4 p-4 pb-24">
      <Link href="/billing" className="inline-flex items-center text-body-sm text-black/60">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to billing
      </Link>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h1 className="text-headline text-black">{invoice.description}</h1>
              <p className="text-body-sm text-black/50">
                {invoice.student.firstName} {invoice.student.lastName} · {invoice.number}
              </p>
            </div>
            <Badge
              variant={
                invoice.status === "PAID" ? "green" : invoice.status === "OVERDUE" ? "red" : "gray"
              }
            >
              {invoice.status}
            </Badge>
          </div>

          <div className="mb-4 rounded-[8px] bg-[#f7f7f5] p-3">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-black/60">Total Amount</span>
              <span className="font-[480] tabular-nums">{formatCurrency(Number(invoice.totalAmount))}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-black/60">Amount Paid</span>
              <span className="font-[480] tabular-nums">{formatCurrency(Number(invoice.amountPaid))}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-black/60">Balance</span>
              <span className="font-[700] tabular-nums">{formatCurrency(balance)}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-black/60">Due Date</span>
              <span className={isOverdue(invoice.dueDate) && invoice.status !== "PAID" ? "text-[#ff3d8b]" : ""}>
                {formatDate(invoice.dueDate)}
              </span>
            </div>
          </div>

          <h2 className="mb-2 text-body-sm font-[540] text-black">Breakdown</h2>
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-[#f1f1f1] py-2 text-body-sm last:border-0"
              >
                <span className="text-black/70">{item.description}</span>
                <span className="font-[480] tabular-nums">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          {invoice.status !== "PAID" && balance > 0 && (
            <button className="mt-6 w-full rounded-[8px] bg-black py-2 text-body-sm font-[480] text-white transition-colors hover:bg-black/80">
              Upload Payment Proof
            </button>
          )}

          {invoice.payments.length > 0 && (
            <>
              <h2 className="mb-2 mt-6 text-body-sm font-[540] text-black">Payment History</h2>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-[8px] bg-[#f7f7f5] p-2 text-body-sm"
                  >
                    <div>
                      <p className="font-[480]">{payment.method.replace("_", " ")}</p>
                      <p className="text-caption">{formatDate(payment.recordedAt)}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-caption ${
                          payment.status === "CONFIRMED"
                            ? "bg-[#c8e6cd] text-[#1ea64a]"
                            : payment.status === "REJECTED"
                              ? "bg-[#efd4d4] text-black"
                              : "bg-[#f4ecd6] text-black"
                        }`}
                      >
                        {payment.status === "CONFIRMED"
                          ? "Confirmed"
                          : payment.status === "REJECTED"
                            ? "Rejected"
                            : "Pending Review"}
                      </span>
                    </div>
                    <span className="font-[480] tabular-nums">{formatCurrency(Number(payment.amount))}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
