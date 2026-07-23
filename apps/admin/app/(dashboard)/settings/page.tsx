import { prisma } from "@school-portal/database";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.schoolSettings.findFirst();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">School Settings</h2>
      <SettingsForm settings={settings} />
    </div>
  );
}
