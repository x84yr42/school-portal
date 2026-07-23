"use client";

import { useState } from "react";
import { Button } from "@school-portal/ui";
import { CheckCircle } from "lucide-react";

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
      alert("Failed to acknowledge. Please try again.");
    }
    setLoading(false);
  }

  if (acknowledged) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">You have acknowledged this announcement</span>
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
