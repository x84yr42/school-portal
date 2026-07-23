import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = hashSync("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@school.edu" },
    update: {},
    create: {
      email: "admin@school.edu",
      name: "School Admin",
      role: "ADMIN",
      passwordHash: adminPassword,
    },
  });

  // Parent user
  const parentPassword = hashSync("parent123", 10);
  const parent = await prisma.user.upsert({
    where: { email: "parent@email.com" },
    update: {},
    create: {
      email: "parent@email.com",
      name: "Juan Dela Cruz",
      role: "PARENT",
      passwordHash: parentPassword,
    },
  });

  // Class
  const class1 = await prisma.class.upsert({
    where: { id: "cl_001" },
    update: {},
    create: {
      id: "cl_001",
      name: "Grade 1 - Section A",
      grade: 1,
      section: "A",
      teacherId: admin.id,
    },
  });

  // Student
  const student = await prisma.student.upsert({
    where: { id: "st_001" },
    update: {},
    create: {
      id: "st_001",
      firstName: "Maria",
      lastName: "Dela Cruz",
      dateOfBirth: new Date("2016-05-15"),
      allergies: "None",
    },
  });

  // Family link
  await prisma.family.upsert({
    where: { id: "fam_001" },
    update: {},
    create: {
      id: "fam_001",
      userId: parent.id,
      studentId: student.id,
      relationship: "Father",
      isPrimary: true,
    },
  });

  // Enrollment
  await prisma.classEnrollment.upsert({
    where: { id: "enr_001" },
    update: {},
    create: {
      id: "enr_001",
      studentId: student.id,
      classId: class1.id,
    },
  });

  // Subject
  const subject = await prisma.subject.upsert({
    where: { code: "MATH" },
    update: {},
    create: {
      code: "MATH",
      name: "Mathematics",
      color: "#3b82f6",
    },
  });

  // Schedule slot
  await prisma.scheduleSlot.upsert({
    where: { id: "slot_001" },
    update: {},
    create: {
      id: "slot_001",
      dayOfWeek: 0,
      startTime: "08:00",
      endTime: "09:00",
      classId: class1.id,
      subjectId: subject.id,
      teacherId: admin.id,
    },
  });

  // Announcement
  await prisma.announcement.upsert({
    where: { id: "ann_001" },
    update: {},
    create: {
      id: "ann_001",
      title: "Welcome to the new portal!",
      body: "Parents can now view announcements, schedules, and billing through this app.",
      category: "GENERAL",
      priority: "NORMAL",
      createdBy: admin.id,
      publishedAt: new Date(),
      isPublished: true,
    },
  });

  // Activity
  await prisma.activity.upsert({
    where: { id: "act_001" },
    update: {},
    create: {
      id: "act_001",
      title: "Field Trip to the Museum",
      description: "Grade 1 field trip to the National Museum. Please confirm participation.",
      participationType: "OPTIONAL",
      consentRequired: true,
      status: "ACTIVE",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Workshop group
  const workshop = await prisma.workshopGroup.upsert({
    where: { id: "ws_001" },
    update: {},
    create: {
      id: "ws_001",
      name: "Art Club",
      description: "After-school art activities",
    },
  });

  await prisma.studentWorkshopEnrollment.upsert({
    where: { id: "wse_001" },
    update: {},
    create: {
      id: "wse_001",
      studentId: student.id,
      workshopGroupId: workshop.id,
    },
  });

  // Student link code for parent registration
  await prisma.studentLinkCode.upsert({
    where: { id: "slc_001" },
    update: {},
    create: {
      id: "slc_001",
      code: "MARIA2026",
      studentId: student.id,
      usedByUserId: parent.id,
      isUsed: true,
      usedAt: new Date(),
    },
  });

  // Invoice
  await prisma.invoice.upsert({
    where: { id: "inv_001" },
    update: {},
    create: {
      id: "inv_001",
      number: "INV-2026-001",
      description: "Monthly Tuition - July 2026",
      lineItems: [{ description: "Monthly Tuition", amount: 5000 }],
      totalAmount: 5000,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      studentId: student.id,
      status: "SENT",
    },
  });

  // School settings
  await prisma.schoolSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      schoolName: "Little Scholars Academy",
      currency: "PHP",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
