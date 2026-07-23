import { prisma } from "@school-portal/database";
import { SettingsForm } from "@/components/settings-form";
import { Eyebrow } from "@school-portal/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.schoolSettings.findFirst();

  return (
    <div className="space-y-12">
      <div>
        <Eyebrow className="mb-2 block">CONFIGURATION</Eyebrow>
        <h2 className="text-display-lg text-black">School Settings</h2>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
