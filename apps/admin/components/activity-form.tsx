"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@school-portal/ui";
import { Plus, X, Image as ImageIcon } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string | null;
  location: string | null;
  images: unknown;
  participationType: string;
  consentRequired: boolean;
  choices: unknown;
  cost: number | null;
  capacity: number | null;
  deadline: string | null;
  status: string;
}

interface Choice {
  id: string;
  label: string;
  image?: string;
}

interface ActivityFormProps {
  activity?: Activity | null;
  onClose: () => void;
}

export function ActivityForm({ activity, onClose }: ActivityFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    activity?.images ? (activity.images as string[]) : []
  );
  const [choices, setChoices] = useState<Choice[]>(
    activity?.choices ? (activity.choices as Choice[]) : []
  );
  const [formData, setFormData] = useState({
    title: activity?.title ?? "",
    description: activity?.description ?? "",
    date: activity?.date ? activity.date.split("T")[0] : "",
    location: activity?.location ?? "",
    participationType: activity?.participationType ?? "OPTIONAL",
    consentRequired: activity?.consentRequired ?? true,
    cost: activity?.cost?.toString() ?? "",
    capacity: activity?.capacity?.toString() ?? "",
    deadline: activity?.deadline ? activity.deadline.split("T")[0] : "",
    status: activity?.status ?? "DRAFT",
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  function addChoice() {
    setChoices([...choices, { id: Date.now().toString(), label: "" }]);
  }

  function updateChoice(id: string, label: string) {
    setChoices(choices.map((c) => (c.id === id ? { ...c, label } : c)));
  }

  function removeChoice(id: string) {
    setChoices(choices.filter((c) => c.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!activity;
    const res = await fetch("/api/activities", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { id: activity.id } : {}),
        ...formData,
        images: images.length > 0 ? images : null,
        choices: choices.filter((c) => c.label).length > 0 ? choices.filter((c) => c.label) : null,
      }),
    });

    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      // silently fail - user can retry
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!activity || !window.confirm("Delete this activity?")) return;
    const res = await fetch(`/api/activities?id=${activity.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      // silently fail - user can retry
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6"
      >
        <h3 className="text-headline text-black">
          {activity ? "Edit Activity" : "Create Activity"}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participationType">Participation</Label>
            <select
              id="participationType"
              className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
              value={formData.participationType}
              onChange={(e) => setFormData({ ...formData, participationType: e.target.value })}
            >
              <option value="REQUIRED">Required</option>
              <option value="OPTIONAL">Optional</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost (optional)</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (optional)</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Response Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="consentRequired"
              checked={formData.consentRequired}
              onChange={(e) => setFormData({ ...formData, consentRequired: e.target.checked })}
              className="h-4 w-4 rounded border-[#e6e6e6]"
            />
            <Label htmlFor="consentRequired">Consent Required</Label>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photos</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload Photos
          </Button>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-16 w-16 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Choices Builder */}
        <div className="space-y-2">
          <Label>Choices (e.g., shirt designs, participation options)</Label>
          {choices.map((choice) => (
            <div key={choice.id} className="flex gap-2">
              <Input
                placeholder="Choice label"
                value={choice.label}
                onChange={(e) => updateChoice(choice.id, e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={() => removeChoice(choice.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addChoice}>
            <Plus className="mr-1 h-3 w-3" />
            Add Choice
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : activity ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          {activity && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
