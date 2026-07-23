import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@school-portal/ui";
import { formatTime, DAYS_OF_WEEK } from "@school-portal/shared";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await auth();
  const families = await prisma.family.findMany({
    where: { userId: session?.user?.id },
    select: { studentId: true },
  });
  const studentIds = families.map((f) => f.studentId);

  const slots = await prisma.scheduleSlot.findMany({
    where: { class: { enrollments: { some: { studentId: { in: studentIds } } } } },
    include: { subject: true, class: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const slotsByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    slots: slots.filter((s) => s.dayOfWeek === index),
  }));

  return (
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Class Schedule</h2>

      <div className="space-y-3">
        {slotsByDay.map(({ day, slots }) => (
          <Card key={day}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-500">No classes</p>
                ) : (
                  slots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{slot.subject.name}</div>
                        <div className="text-xs text-gray-500">{slot.class.name}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
