import { NextResponse } from "next/server";
import { prisma } from "@school-portal/database";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateUniqueCode(existing: Set<string>): string {
  let code = generateCode();
  while (existing.has(code)) {
    code = generateCode();
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rows: { firstName: string; lastName: string; dateOfBirth?: string; allergies?: string; medicalNotes?: string }[] = body.students;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No students provided" }, { status: 400 });
    }

    // Get existing codes to avoid duplicates
    const existingCodes = new Set(
      (await prisma.studentLinkCode.findMany({ select: { code: true } })).map((c) => c.code)
    );

    const results = [];
    for (const row of rows) {
      if (!row.firstName || !row.lastName) continue;

      const code = generateUniqueCode(existingCodes);
      existingCodes.add(code);

      const student = await prisma.student.create({
        data: {
          firstName: row.firstName,
          lastName: row.lastName,
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
          allergies: row.allergies || null,
          medicalNotes: row.medicalNotes || null,
        },
      });

      await prisma.studentLinkCode.create({
        data: {
          code,
          studentId: student.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      results.push({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        code,
      });
    }

    return NextResponse.json({ students: results, count: results.length });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Failed to import students" }, { status: 500 });
  }
}
