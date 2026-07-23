"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Megaphone, CalendarCheck, CreditCard, Clock, Settings } from "@school-portal/ui";
import { cn } from "@school-portal/ui";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/announcements", icon: Megaphone, label: "News" },
  { href: "/activities", icon: CalendarCheck, label: "Activities" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/schedule", icon: Clock, label: "Schedule" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e6e6e6] bg-white pb-safe">
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center p-2",
                isActive ? "text-black" : "text-black/30"
              )}
            >
              <Icon size={24} />
              {isActive && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-black" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
