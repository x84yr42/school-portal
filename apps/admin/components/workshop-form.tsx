"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@school-portal/ui";

export function WorkshopForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description || null,
      }),
    });

    if (res.ok) {
      setFormData({ name: "", description: "" });
      router.refresh();
    } else {
      alert("Failed to create workshop group");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Add Workshop Group</h3>
      <div className="space-y-2">
        <Label htmlFor="name">Workshop Name</Label>
        <Input
          id="name"
          placeholder="e.g. Art Workshop, Science Club"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the workshop"
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Workshop Group"}
      </Button>
    </form>
  );
}
