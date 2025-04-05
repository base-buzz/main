"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  UserIcon,
  BookmarkIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  UserIcon as UserIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  HashtagIcon as HashtagIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  BuildingLibraryIcon as BuildingLibraryIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  EllipsisHorizontalCircleIcon as EllipsisHorizontalCircleIconSolid,
} from "@heroicons/react/24/solid";
import { useAccount } from "wagmi";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { NavIcon } from "@/components/ui/nav-icon";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

export const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    href: "/explore",
    label: "Explore",
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
    href: "/ai-minter",
    label: "AI Minter",
    icon: HashtagIcon,
    activeIcon: HashtagIconSolid,
  },
  {
    href: "/bookmarks",
    label: "Bookmarks",
    icon: BookmarkIcon,
    activeIcon: BookmarkIconSolid,
    requiresAuth: true,
  },
  {
    href: "/token-hubs",
    label: "Token Hubs",
    icon: BuildingLibraryIcon,
    activeIcon: BuildingLibraryIconSolid,
  },
  {
    href: "/verified-projects",
    label: "Verified Projects",
    icon: ShieldCheckIcon,
    activeIcon: ShieldCheckIconSolid,
  },
  {
    href: "/buzzboard",
    label: "Buzzboard",
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    href: "/chatrooms",
    label: "Chatrooms",
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserIcon,
    activeIcon: UserIconSolid,
    requiresAuth: true,
  },
];

interface DesktopNavigationProps {
  className?: string;
}

export default function DesktopNavigation({
  className,
}: DesktopNavigationProps) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { unreadCount } = useUnreadMessages();
  const { user } = useCurrentUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <nav className={cn("flex h-screen flex-col bg-background px-3", className)}>
      {/* Logo - Fixed at top */}
      <Link
        href="/home"
        className="flex h-14 w-14 items-center justify-center rounded-full hover:bg-accent/10"
      >
        <img src="/logo.svg" alt="BaseBuzz" className="h-8 w-8 dark:invert" />
      </Link>

      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = isActive ? item.activeIcon : item.icon;

            if (item.requiresAuth && !isConnected) {
              return (
                <button
                  key={item.href}
                  className={cn(
                    "group flex min-w-[200px] items-center gap-4 rounded-full p-3 transition-all duration-200 ease-in-out hover:bg-muted hover:shadow-sm dark:hover:bg-gray-800",
                    isActive && "font-bold dark:bg-gray-800"
                  )}
                >
                  <NavIcon
                    icon={Icon}
                    isActive={isActive}
                    showNotificationDot={item.href === "/notifications"}
                    unreadCount={
                      item.href === "/messages" ? unreadCount : undefined
                    }
                    className="h-[26px] w-[26px]"
                  />
                  <span className="text-xl text-foreground dark:text-white">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-w-[200px] items-center gap-4 rounded-full p-3 transition-all duration-200 ease-in-out hover:bg-muted hover:shadow-sm dark:hover:bg-gray-800",
                  isActive && "font-bold dark:bg-gray-800"
                )}
              >
                <NavIcon
                  icon={Icon}
                  isActive={isActive}
                  showNotificationDot={item.href === "/notifications"}
                  unreadCount={
                    item.href === "/messages" ? unreadCount : undefined
                  }
                  className="h-[26px] w-[26px]"
                />
                <span className="text-xl text-foreground dark:text-white">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="mt-auto">
        {/* Post Button */}
        <div className="mb-4 px-2">
          <Link
            href="/compose"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#1d9bf0] font-bold text-white transition-colors hover:bg-[#1a8cd8] dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Post
          </Link>
        </div>

        {/* Profile Section */}
        <div className="border-t border-border">
          <div className="py-3">
            <button
              onClick={() => isConnected && setIsEditProfileOpen(true)}
              className="flex w-full items-center gap-3 rounded-full p-3 transition-all duration-200 ease-in-out hover:bg-muted hover:shadow-sm dark:hover:bg-gray-800"
            >
              <div className="h-10 w-10 overflow-hidden rounded-full bg-accent">
                <img
                  src={user?.avatar_url || "/default-avatar.png"}
                  alt={user?.display_name || "Profile"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold leading-5 text-foreground">
                  {user?.display_name || "Anonymous"}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{user?.address?.slice(0, 8) || "anon"}
                </div>
              </div>
              <div className="flex h-4 w-4 items-center justify-center gap-0.5">
                <span className="block h-1 w-1 rounded-full bg-foreground" />
                <span className="block h-1 w-1 rounded-full bg-foreground" />
                <span className="block h-1 w-1 rounded-full bg-foreground" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </nav>
  );
}
