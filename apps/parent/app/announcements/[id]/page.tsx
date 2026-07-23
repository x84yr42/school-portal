import { prisma } from "@school-portal/database";
import { Card, CardContent, Badge, Button } from "@school-portal/ui";
import { formatDate } from "@school-portal/shared";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!announcement) {
    return (
      <div className="p-4">
        <p>Announcement not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <Link href="/announcements" className="inline-flex items-center text-sm text-gray-600">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to announcements
      </Link>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">{announcement.title}</h1>
            <Badge variant={announcement.priority === "EMERGENCY" ? "red" : "default"}>
              {announcement.priority}
            </Badge>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            {formatDate(announcement.createdAt)} · {announcement.author.name}
          </p>
          <p className="whitespace-pre-wrap text-gray-700">{announcement.body}</p>

          {announcement.requiresAck && (
            <Button className="mt-6 w-full">Mark as Read</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
