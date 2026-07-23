import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";
import { hashSync } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, code, codes: rawCodes } = body;

    // Support both single code (legacy) and multiple codes
    const codes: string[] = rawCodes
      ? Array.isArray(rawCodes)
        ? rawCodes
        : [rawCodes]
      : code
        ? [code]
        : [];

    if (!email || !password || !name || codes.length === 0) {
      return NextResponse.json(
        { error: "All fields are required, including at least one student code" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Validate all codes first
    const linkCodes = [];
    for (const c of codes) {
      const linkCode = await prisma.studentLinkCode.findUnique({
        where: { code: c },
        include: { student: true },
      });

      if (!linkCode) {
        return NextResponse.json(
          { error: `Invalid student code: ${c}` },
          { status: 400 }
        );
      }

      if (linkCode.isUsed && linkCode.usedByUserId) {
        return NextResponse.json(
          { error: `This code has already been used: ${c}` },
          { status: 400 }
        );
      }

      if (linkCode.expiresAt && new Date() > linkCode.expiresAt) {
        return NextResponse.json(
          { error: `This code has expired: ${c}` },
          { status: 400 }
        );
      }

      linkCodes.push(linkCode);
    }

    const hashedPassword = hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: "PARENT",
      },
    });

    // Link all children
    for (let i = 0; i < linkCodes.length; i++) {
      const linkCode = linkCodes[i];
      await prisma.family.create({
        data: {
          userId: user.id,
          studentId: linkCode.studentId,
          relationship: "Parent/Guardian",
          isPrimary: i === 0,
        },
      });

      await prisma.studentLinkCode.update({
        where: { id: linkCode.id },
        data: {
          isUsed: true,
          usedByUserId: user.id,
          usedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
