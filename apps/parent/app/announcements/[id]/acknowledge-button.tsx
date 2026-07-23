"use client";

import { useState } from "react";
import { Button } from "@school-portal/ui";
import { CheckCircle } from "@school-portal/ui";

export function AcknowledgeButton({
  announcementId,
  hasAcknowledged,
}: {
  announcementId: string;
  hasAcknowledged: boolean;
}) {
  const [acknowledged, setAcknowledged] = useState(hasAcknowledged);
  const [loading, setLoading] = useState(false);

  async function handleAcknowledge() {
    setLoading(true);
    const res = await fetch("/api/announcements/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId }),
    });
    if (res.ok) {
      setAcknowledged(true);
    } else {
      // silently fail – user can retry
    }
    setLoading(false);
  }

  if (acknowledged) {
    return (
      <div className="flex items-center gap-2 rounded-[8px] bg-[#c8e6cd] p-3 text-[#1ea64a]">
        <CheckCircle className="h-5 w-5" />
        <span className="text-body-sm font-[480]">You have acknowledged this announcement</span>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      onClick={handleAcknowledge}
      disabled={loading}
    >
      {loading ? "Acknowledging..." : "Mark as Read / Acknowledge"}
    </Button>
  );
}
