import { prisma } from "@school-portal/database";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import { AnnouncementForm } from "@/components/announcement-form";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await auth();
  const [announcements, classes, workshops] = await Promise.all([
    prisma.announcement.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({ orderBy: [{ grade: "asc" }, { name: "asc" }] }),
    prisma.workshopGroup.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>

      <AnnouncementForm
        classes={classes.map((c) => ({ id: c.id, name: c.name, grade: c.grade }))}
        workshops={workshops.map((w) => ({ id: w.id, name: w.name }))}
        userId={session?.user?.id as string}
      />

      <div className="grid gap-4">
        {announcements.map((announcement) => {
          const target = announcement.targetAudience ? JSON.parse(announcement.targetAudience) : null;
          return (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      By {announcement.author.name} · {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                  <Badge variant={announcement.priority === "EMERGENCY" ? "red" : "default"}>
                    {announcement.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-gray-600">{announcement.body}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <span>Status: {announcement.isPublished ? "Published" : "Draft"}</span>
                  {target && (
                    <Badge variant="gray">
                      {target.type}: {target.value}
                    </Badge>
                  )}
                  {announcement.requiresAck && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                      Requires Acknowledgment
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
