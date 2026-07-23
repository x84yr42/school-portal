"use client";

import { signOut } from "next-auth/react";
import { Card, CardContent, Button, Eyebrow } from "@school-portal/ui";
import { LogOut, Bell, Shield, User, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-4 pb-24">
      <div>
        <Eyebrow className="mb-2 block">PREFERENCES</Eyebrow>
        <h2 className="text-display-lg text-black leading-none">Settings</h2>
      </div>

      <Card className="cursor-pointer transition-colors hover:bg-[#f7f7f5]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f5]">
              <User className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-[480]">Account</p>
              <p className="text-caption">Manage your profile and linked children</p>
            </div>
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer transition-colors hover:bg-[#f7f7f5]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f5]">
              <Bell className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-[480]">Notifications</p>
              <p className="text-caption">Push, email, and SMS preferences</p>
            </div>
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer transition-colors hover:bg-[#f7f7f5]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f5]">
              <Shield className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-[480]">Security</p>
              <p className="text-caption">Change password and login settings</p>
            </div>
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button
          variant="default"
          className="w-full"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Sign out
        </Button>
      </div>
    </div>
  );
}