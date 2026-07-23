"use client";

import { signOut } from "next-auth/react";
import { Card, CardContent, Button } from "@school-portal/ui";
import { LogOut, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Account</p>
              <p className="text-sm text-gray-500">Manage your profile and linked children</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-sm text-gray-500">Push, email, and SMS preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Security</p>
              <p className="text-sm text-gray-500">Change password and login settings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full border-red-300 text-red-600 hover:bg-red-50"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
