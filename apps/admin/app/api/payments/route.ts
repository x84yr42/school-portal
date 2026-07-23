import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, status } = body;

    if (!paymentId || !status) {
      return new NextResponse("Missing paymentId or status", { status: 400 });
    }

    if (!["CONFIRMED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
      include: { invoice: true },
    });

    // Update invoice status based on payment confirmation
    const invoice = payment.invoice;
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId: invoice.id },
    });

    const totalConfirmed = allPayments
      .filter((p) => p.status === "CONFIRMED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    let newInvoiceStatus: "SENT" | "PARTIALLY_PAID" | "PAID" = "SENT";
    if (totalConfirmed >= Number(invoice.totalAmount)) {
      newInvoiceStatus = "PAID";
    } else if (totalConfirmed > 0) {
      newInvoiceStatus = "PARTIALLY_PAID";
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: newInvoiceStatus,
        amountPaid: totalConfirmed,
      },
    });

    return NextResponse.json({ payment, invoiceStatus: newInvoiceStatus });
  } catch (error) {
    console.error("Payment update error:", error);
    return new NextResponse("Failed to update payment", { status: 500 });
  }
}

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { invoice: { include: { student: true } } },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(payments);
}
