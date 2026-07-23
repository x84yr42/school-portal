import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const workshop = await prisma.workshopGroup.findUnique({
      where: { id },
      include: {
        teacher: true,
        enrollments: {
          include: { student: true },
          orderBy: { student: { lastName: "asc" } },
        },
      },
    });
    if (!workshop) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(workshop);
  }

  const workshops = await prisma.workshopGroup.findMany({
    include: {
      teacher: true,
      enrollments: { include: { student: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workshops);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workshop = await prisma.workshopGroup.create({
      data: {
        name: body.name,
        description: body.description,
        teacherId: body.teacherId || null,
        scheduleDay: body.scheduleDay != null ? parseInt(body.scheduleDay) : null,
        scheduleStartTime: body.scheduleStartTime || null,
        scheduleEndTime: body.scheduleEndTime || null,
      },
    });
    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create workshop group" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const workshop = await prisma.workshopGroup.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        teacherId: body.teacherId || null,
        scheduleDay: body.scheduleDay != null ? parseInt(body.scheduleDay) : null,
        scheduleStartTime: body.scheduleStartTime || null,
        scheduleEndTime: body.scheduleEndTime || null,
      },
    });
    return NextResponse.json(workshop);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update workshop group" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.workshopGroup.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete workshop group" }, { status: 500 });
  }
}
