import { prisma } from "@school-portal/database";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@school-portal/ui";
import { formatTime, DAYS_OF_WEEK } from "@school-portal/shared";
import { ScheduleForm } from "@/components/schedule-form";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [slots, classes, subjects, teachers] = await Promise.all([
    prisma.scheduleSlot.findMany({
      include: { class: true, subject: true, teacher: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.class.findMany({ orderBy: [{ grade: "asc" }, { name: "asc" }] }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN"] } },
      orderBy: { name: "asc" },
    }),
  ]);

  const slotsByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    slots: slots.filter((s) => s.dayOfWeek === index),
  }));

  return (
    <div className="space-y-12">
      <div>
        <Eyebrow className="mb-2 block">TIMETABLE</Eyebrow>
        <h2 className="text-display-lg text-black">Class Schedule</h2>
      </div>

      <ScheduleForm
        classes={classes.map((c) => ({ id: c.id, name: c.name, grade: c.grade }))}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        teachers={teachers.map((t) => ({ id: t.id, name: t.name }))}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {slotsByDay.map(({ day, slots }) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="text-body-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {slots.length === 0 ? (
                <p className="text-body-sm">No slots</p>
              ) : (
                slots.map((slot) => (
                  <div key={slot.id} className="rounded-[8px] bg-[#f7f7f5] p-3 text-body-sm">
                    <div className="font-[480]">{slot.subject.name}</div>
                    <div>
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </div>
                    <div className="text-[13px]">
                      {slot.class.name} · {slot.teacher?.name || "—"}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
