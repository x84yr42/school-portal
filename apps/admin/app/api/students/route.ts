import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      families: {
        include: { user: true },
      },
      enrollments: {
        include: { class: true },
      },
    },
    orderBy: { lastName: "asc" },
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
        allergies: body.allergies,
        medicalNotes: body.medicalNotes,
      },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
