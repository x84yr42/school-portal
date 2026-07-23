"use client";

import { useState } from "react";
import { Button, Input, Label } from "@school-portal/ui";

interface SettingsFormProps {
  settings: {
    id: string;
    schoolName: string;
    logo: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    academicYear: string | null;
    currency: string;
    timezone: string;
  } | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: settings?.schoolName ?? "Little Scholars Academy",
    address: settings?.address ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    academicYear: settings?.academicYear ?? "",
    currency: settings?.currency ?? "PHP",
    timezone: settings?.timezone ?? "Asia/Manila",
  });

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setSaved(true);
    } else {
      // silently fail - user can retry
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[24px] border border-[#e6e6e6] bg-white p-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="schoolName">School Name</Label>
          <Input
            id="schoolName"
            value={formData.schoolName}
            onChange={(e) => handleChange("schoolName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic Year</Label>
          <Input
            id="academicYear"
            placeholder="e.g. 2026-2027"
            value={formData.academicYear}
            onChange={(e) => handleChange("academicYear", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
          >
            <option value="PHP">PHP (Philippine Peso)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
            value={formData.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
          >
            <option value="Asia/Manila">Asia/Manila</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New York</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          rows={2}
          className="flex w-full rounded-[8px] border border-[#e6e6e6] px-3 py-2 text-body-sm"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
        {saved && <span className="text-body-sm text-[#1ea64a]">Settings saved successfully!</span>}
      </div>
    </form>
  );
}
