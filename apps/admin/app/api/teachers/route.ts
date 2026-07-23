import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";
import { hash } from "bcryptjs";

export async function GET() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: {
      teacherClasses: true,
      teacherWorkshops: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const passwordHash = await hash(body.password, 10);
    const teacher = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash,
        role: "TEACHER",
      },
    });
    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {
      name: body.name,
      email: body.email,
      phone: body.phone,
    };
    if (body.password) {
      data.passwordHash = await hash(body.password, 10);
    }
    const teacher = await prisma.user.update({
      where: { id: body.id },
      data,
    });
    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
