"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CalendarCheck,
  CreditCard,
  Clock,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Palette,
  BookOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@school-portal/ui";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/parents", label: "Parents", icon: Users },
  { href: "/teachers", label: "Teachers", icon: BookOpen },
  { href: "/classes", label: "Classes", icon: GraduationCap },
  { href: "/workshops", label: "Workshops", icon: Palette },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/activities", label: "Activities", icon: CalendarCheck },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/schedule", label: "Schedule", icon: Clock },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#e6e6e6] bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-[#e6e6e6] px-6">
          <span className="text-headline text-black leading-none">Little Scholars</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[50px] px-4 py-2.5 text-body-sm transition-colors",
                  isActive
                    ? "bg-black text-white font-[480]"
                    : "text-black font-[330] hover:bg-[#f7f7f5]"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-[#e6e6e6] p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-[50px] px-4 py-2.5 text-body-sm font-[330] text-black hover:bg-[#f7f7f5] transition-colors"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
