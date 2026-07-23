import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshopId, studentIds } = body as { workshopId: string; studentIds: string[] };

    if (!workshopId || !studentIds?.length) {
      return NextResponse.json({ error: "workshopId and studentIds are required" }, { status: 400 });
    }

    const enrollments = await Promise.all(
      studentIds.map((studentId) =>
        prisma.studentWorkshopEnrollment.upsert({
          where: { studentId_workshopGroupId: { studentId, workshopGroupId: workshopId } },
          create: { studentId, workshopGroupId: workshopId },
          update: { isActive: true },
        })
      )
    );

    return NextResponse.json({ count: enrollments.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to enroll students" }, { status: 500 });
  }
}
