import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: { student: true, payments: true },
    orderBy: { dueDate: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoice = await prisma.invoice.create({
      data: {
        number: body.number,
        description: body.description,
        lineItems: body.lineItems,
        totalAmount: parseFloat(body.totalAmount),
        dueDate: new Date(body.dueDate),
        studentId: body.studentId,
        status: "SENT",
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
