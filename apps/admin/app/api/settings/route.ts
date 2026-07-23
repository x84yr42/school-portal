import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

export async function GET() {
  const settings = await prisma.schoolSettings.findFirst();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const settings = await prisma.schoolSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...body },
      update: body,
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
