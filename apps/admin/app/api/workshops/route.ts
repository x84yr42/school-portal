import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const workshops = await prisma.workshopGroup.findMany({
    include: {
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
      },
    });
    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create workshop group" }, { status: 500 });
  }
}
