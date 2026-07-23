import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

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
