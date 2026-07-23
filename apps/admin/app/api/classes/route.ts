import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
      enrollments: { include: { student: true } },
      scheduleSlots: { include: { subject: true } },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cls = await prisma.class.create({
      data: {
        name: body.name,
        grade: parseInt(body.grade),
        section: body.section,
        teacherId: body.teacherId || null,
      },
    });
    return NextResponse.json(cls, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
