"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
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
  const reduce = useReducedMotion();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e6e6e6] bg-white pb-safe">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-1 p-2 transition-colors",
                isActive ? "text-black" : "text-black/30"
              )}
            >
              <Icon size={24} />
              {isActive &&
                (reduce ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-black" />
                ) : (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="h-1.5 w-1.5 rounded-full bg-black"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                ))}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
