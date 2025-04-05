"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
} from "@heroicons/react/24/solid";
import { NavIcon } from "@/components/ui/nav-icon";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

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
  },
  {
    href: "/messages",
    label: "Messages",
    icon: EnvelopeIcon,
    activeIcon: EnvelopeIconSolid,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadMessages();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="grid h-[50px] grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center",
                "transition-colors hover:bg-accent/5 active:bg-accent/10",
                // Larger touch target
                "-mt-3 pb-3 pt-3",
              )}
            >
              <NavIcon
                icon={Icon}
                isActive={isActive}
                showNotificationDot={item.label === "Notifications"}
                unreadCount={
                  item.label === "Messages" ? unreadCount : undefined
                }
                className="h-[24px] w-[24px]"
              />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
