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
      <Link href="/billing" className="inline-flex items-center text-sm text-gray-600">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to billing
      </Link>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{invoice.description}</h1>
              <p className="text-sm text-gray-500">
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

          <div className="mb-4 rounded-md bg-gray-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">{formatCurrency(Number(invoice.totalAmount))}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium">{formatCurrency(Number(invoice.amountPaid))}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Balance</span>
              <span className="font-bold">{formatCurrency(balance)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Due Date</span>
              <span className={isOverdue(invoice.dueDate) && invoice.status !== "PAID" ? "text-red-600" : ""}>
                {formatDate(invoice.dueDate)}
              </span>
            </div>
          </div>

          <h2 className="mb-2 font-semibold text-gray-900">Breakdown</h2>
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0"
              >
                <span className="text-gray-700">{item.description}</span>
                <span className="font-medium">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          {invoice.status !== "PAID" && balance > 0 && (
            <button className="mt-6 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white">
              Upload Payment Proof
            </button>
          )}

          {invoice.payments.length > 0 && (
            <>
              <h2 className="mb-2 mt-6 font-semibold text-gray-900">Payment History</h2>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{payment.method.replace("_", " ")}</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.recordedAt)}</p>
                    </div>
                    <span className="font-medium">{formatCurrency(Number(payment.amount))}</span>
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
