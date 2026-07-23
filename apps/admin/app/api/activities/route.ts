import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const activities = await prisma.activity.findMany({
    include: { responses: true },
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
        participationType: body.participationType || "OPTIONAL",
        consentRequired: body.consentRequired ?? true,
        choices: body.choices,
        cost: body.cost ? parseFloat(body.cost) : null,
        capacity: body.capacity,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: body.status || "DRAFT",
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
