import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const slots = await prisma.scheduleSlot.findMany({
    include: { class: true, subject: true, teacher: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(slots);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slot = await prisma.scheduleSlot.create({
      data: {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        classId: body.classId,
        subjectId: body.subjectId,
        teacherId: body.teacherId,
      },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create schedule slot" }, { status: 500 });
  }
}
