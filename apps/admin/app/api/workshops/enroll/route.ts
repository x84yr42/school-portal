import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workshopGroupId = searchParams.get("workshopGroupId");
  if (!workshopGroupId) return NextResponse.json({ error: "workshopGroupId required" }, { status: 400 });

  const enrollments = await prisma.studentWorkshopEnrollment.findMany({
    where: { workshopGroupId, isActive: true },
    include: { student: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { student: { lastName: "asc" } },
  });
  return NextResponse.json(enrollments);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workshopGroupId = body.workshopGroupId || body.workshopId;
    const { studentIds } = body as { studentIds: string[] };

    if (!workshopGroupId || !studentIds?.length) {
      return NextResponse.json({ error: "workshopGroupId and studentIds are required" }, { status: 400 });
    }

    const enrollments = await Promise.all(
      studentIds.map((studentId: string) =>
        prisma.studentWorkshopEnrollment.upsert({
          where: { studentId_workshopGroupId: { studentId, workshopGroupId } },
          create: { studentId, workshopGroupId },
          update: { isActive: true },
        })
      )
    );

    return NextResponse.json({ count: enrollments.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to enroll students" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workshopGroupId = searchParams.get("workshopGroupId");
    const studentId = searchParams.get("studentId");
    if (!workshopGroupId || !studentId) {
      return NextResponse.json({ error: "workshopGroupId and studentId required" }, { status: 400 });
    }
    await prisma.studentWorkshopEnrollment.update({
      where: { studentId_workshopGroupId: { studentId, workshopGroupId } },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove enrollment" }, { status: 500 });
  }
}
