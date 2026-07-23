import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const id = searchParams.get("id");

  if (id) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        families: { include: { user: true } },
        enrollments: { include: { class: true } },
        workshopEnrollments: { include: { workshopGroup: true } },
        invoices: { include: { payments: true }, orderBy: { dueDate: "desc" } },
        activityResponses: { include: { activity: true } },
        pickupContacts: true,
        linkCodes: true,
      },
    });
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  }

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const students = await prisma.student.findMany({
    where,
    include: {
      families: { include: { user: true } },
      enrollments: { include: { class: true } },
    },
    orderBy: { lastName: "asc" },
    take: q ? 20 : undefined,
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const student = await prisma.student.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        phone: body.phone,
        allergies: body.allergies,
        medicalNotes: body.medicalNotes,
      },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const student = await prisma.student.update({
      where: { id: body.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        phone: body.phone,
        allergies: body.allergies,
        medicalNotes: body.medicalNotes,
      },
    });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
