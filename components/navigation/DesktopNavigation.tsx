"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  UserIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  UserIcon as UserIconSolid,
  EllipsisHorizontalCircleIcon as EllipsisHorizontalCircleIconSolid,
} from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    href: "/search",
    label: "Search",
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassIconSolid,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: BellIcon,
    activeIcon: BellIconSolid,
    requiresAuth: true,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: EnvelopeIcon,
    activeIcon: EnvelopeIconSolid,
    requiresAuth: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserIcon,
    activeIcon: UserIconSolid,
    requiresAuth: true,
  },
  {
    href: "/more",
    label: "More",
    icon: EllipsisHorizontalCircleIcon,
    activeIcon: EllipsisHorizontalCircleIconSolid,
  },
];

interface DesktopNavigationProps {
  className?: string;
}

export function DesktopNavigation({ className }: DesktopNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex h-screen flex-col justify-between p-2", className)}
    >
      <div className="space-y-2">
        {/* Logo */}
        <Link
          href="/home"
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full p-3 hover:bg-accent/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-2">
            <img src="/black.svg" alt="BaseBuzz" className="h-5 w-5 invert" />
          </div>
        </Link>

        {/* Navigation Items */}
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 rounded-full p-3",
                "transition-colors hover:bg-accent/10",
                isActive && "font-bold",
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Icon
                  className={cn(
                    "h-[26px] w-[26px]",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {item.label === "Notifications" && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[rgb(29,155,240)]" />
                )}
              </motion.div>
              <span className="text-xl">{item.label}</span>
            </Link>
          );
        })}

        {/* Post Button */}
        <button className="mt-4 w-full rounded-full bg-[rgb(29,155,240)] px-8 py-3 font-bold text-white transition-colors hover:bg-[rgb(29,155,240)]/90">
          <span className="block text-lg">Post</span>
        </button>
      </div>

      {/* Profile Section */}
      <button className="flex items-center gap-3 rounded-full p-3 transition-colors hover:bg-accent/10">
        <div className="h-10 w-10 rounded-full bg-accent" />
        <div className="flex-1 text-left">
          <div className="font-bold">Username</div>
          <div className="text-sm text-muted-foreground">@handle</div>
        </div>
        <EllipsisHorizontalCircleIcon className="h-5 w-5 text-muted-foreground" />
      </button>
    </nav>
  );
}
