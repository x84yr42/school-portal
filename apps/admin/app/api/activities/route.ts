import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const activities = await prisma.activity.findMany({
    include: {
      responses: {
        include: { student: true, parent: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const activity = await prisma.activity.create({
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : null,
        location: body.location,
        images: body.images,
        participationType: body.participationType || "OPTIONAL",
        consentRequired: body.consentRequired ?? true,
        choices: body.choices,
        cost: body.cost ? parseFloat(body.cost) : null,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: body.status || "DRAFT",
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const activity = await prisma.activity.update({
      where: { id: body.id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : null,
        location: body.location,
        images: body.images,
        participationType: body.participationType,
        consentRequired: body.consentRequired,
        choices: body.choices,
        cost: body.cost != null ? parseFloat(body.cost) : null,
        capacity: body.capacity != null ? parseInt(body.capacity) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: body.status,
      },
    });
    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
