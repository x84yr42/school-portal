"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@school-portal/ui";

interface AnnouncementFormProps {
  classes: { id: string; name: string; grade: number }[];
  workshops: { id: string; name: string }[];
  userId: string;
}

const categories = ["GENERAL", "EVENT", "EMERGENCY", "ACTIVITY", "ACADEMIC"];
const priorities = ["NORMAL", "URGENT", "EMERGENCY"];
const targetTypes = [
  { value: "all", label: "All Parents" },
  { value: "grade", label: "Specific Grade" },
  { value: "class", label: "Specific Class" },
  { value: "workshop", label: "Specific Workshop Group" },
];

export function AnnouncementForm({ classes, workshops, userId }: AnnouncementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "GENERAL",
    priority: "NORMAL",
    targetValue: "",
    requiresAck: false,
    publishNow: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const targetAudience =
      targetType === "all" ? null : JSON.stringify({ type: targetType, value: formData.targetValue });

    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        body: formData.body,
        category: formData.category,
        priority: formData.priority,
        targetAudience,
        requiresAck: formData.requiresAck,
        createdBy: userId,
        publishNow: formData.publishNow,
      }),
    });

    if (res.ok) {
      setFormData({
        title: "",
        body: "",
        category: "GENERAL",
        priority: "NORMAL",
        targetValue: "",
        requiresAck: false,
        publishNow: true,
      });
      setTargetType("all");
      router.refresh();
    } else {
      // silently fail - user can retry
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6">
      <h3 className="text-headline text-black">New Announcement</h3>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          rows={4}
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetType">Target Audience</Label>
          <select
            id="targetType"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            {targetTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {targetType === "grade" && (
        <div className="space-y-2">
          <Label htmlFor="targetValue">Grade Level</Label>
          <Input
            id="targetValue"
            type="number"
            placeholder="e.g. 1"
            value={formData.targetValue}
            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
            required
          />
        </div>
      )}

      {targetType === "class" && (
        <div className="space-y-2">
          <Label htmlFor="targetValue">Class</Label>
          <select
            id="targetValue"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.targetValue}
            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
            required
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {targetType === "workshop" && (
        <div className="space-y-2">
          <Label htmlFor="targetValue">Workshop Group</Label>
          <select
            id="targetValue"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.targetValue}
            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
            required
          >
            <option value="">Select workshop</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="requiresAck"
          type="checkbox"
          checked={formData.requiresAck}
          onChange={(e) => setFormData({ ...formData, requiresAck: e.target.checked })}
          className="h-4 w-4 rounded border-[#e6e6e6]"
        />
        <Label htmlFor="requiresAck">Require acknowledgment</Label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Publishing..." : "Publish Announcement"}
      </Button>
    </form>
  );
}
