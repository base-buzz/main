// AI Edit Test Comment
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { Icon, IconName } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUnreadMessages } from "@/components/hooks/useUnreadMessages";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Settings,
  DollarSign,
  Star,
  ListOrdered,
  MoreHorizontal,
  ShieldCheck,
  User,
  Bookmark,
  Briefcase,
  Search,
  Bell,
  MessageSquare,
  Coins,
  BarChart2,
  MessageCircle,
} from "lucide-react";

// Define mobile nav item type
interface MobileNavItem {
  icon: React.ReactNode; // Use ReactNode instead of string for icons
  label: string;
  path: string;
  protected: boolean;
}

export default function MobileSheetNav() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { user } = useCurrentUser();
  const { unreadCount } = useUnreadMessages();
  const [open, setOpen] = React.useState(false);

  // Navigation items that match BaseBuzz's desktop navigation
  const mobileNavItems: MobileNavItem[] = [
    {
      icon: <User className="mr-4 h-6 w-6" />,
      label: "Home",
      path: "/home",
      protected: false,
    },
    {
      icon: <Search className="mr-4 h-6 w-6" />,
      label: "Explore",
      path: "/explore",
      protected: false,
    },
    {
      icon: <Bell className="mr-4 h-6 w-6" />,
      label: "Notifications",
      path: "/notifications",
      protected: true,
    },
    {
      icon: (
        <div className="relative mr-4">
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <div className="absolute -right-1 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1d9bf0] px-1 text-xs font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      ),
      label: "Messages",
      path: "/messages",
      protected: true,
    },
    {
      icon: <Star className="mr-4 h-6 w-6" />,
      label: "AI Minter",
      path: "/ai-minter",
      protected: true,
    },
    {
      icon: <Bookmark className="mr-4 h-6 w-6" />,
      label: "Bookmarks",
      path: "/bookmarks",
      protected: true,
    },
    {
      icon: <Coins className="mr-4 h-6 w-6" />,
      label: "Token Hubs",
      path: "/token-hubs",
      protected: true,
    },
    {
      icon: <ShieldCheck className="mr-4 h-6 w-6" />,
      label: "Verified Projects",
      path: "/verified-projects",
      protected: true,
    },
    {
      icon: <BarChart2 className="mr-4 h-6 w-6" />,
      label: "Buzzboard",
      path: "/buzzboard",
      protected: true,
    },
    {
      icon: <MessageCircle className="mr-4 h-6 w-6" />,
      label: "Chatrooms",
      path: "/chatrooms",
      protected: true,
    },
    {
      icon: <MoreHorizontal className="mr-4 h-6 w-6" />,
      label: "More",
      path: "/more",
      protected: false,
    },
  ];

  const handleNavClick = (path: string) => {
    setOpen(false);
    return true;
  };

  // Only render if we're not on the landing page
  if (pathname === "/") return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center">
          {isConnected && user ? (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.avatar_url || "https://i.pravatar.cc/150"}
                alt={user.display_name || "User"}
              />
              <AvatarFallback>{user.display_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[70%] max-w-xs p-0 pt-0">
        <div className="flex h-full flex-col">
          {/* BaseBuzz Logo */}
          <div className="flex h-[53px] items-center justify-center border-b border-border">
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link
                href="/home"
                className="flex items-center justify-center"
                onClick={() => setOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-2">
                  <Image
                    src="/black.svg"
                    alt="BaseBuzz"
                    width={20}
                    height={20}
                    className="invert"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-b border-border p-4">
            <div className="mb-4 flex items-center justify-between">
              {isConnected && user ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar_url || "https://i.pravatar.cc/150"}
                    alt={user.display_name || "User"}
                  />
                  <AvatarFallback>
                    {user.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
              {!isConnected && (
                <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <span>0x72...377A</span>
                </button>
              )}
            </div>

            {isConnected && user ? (
              <>
                <div className="mt-2">
                  <div className="text-lg font-bold">
                    {user.display_name || "User"}
                  </div>
                  <div className="text-muted-foreground">
                    @
                    {user.display_name?.toLowerCase().replace(/\s+/g, "_") ||
                      "user"}
                  </div>
                </div>

                <div className="mt-3 flex gap-4">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">128</span>
                    <span className="text-muted-foreground">Following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">81</span>
                    <span className="text-muted-foreground">Followers</span>
                  </div>
                </div>
              </>
            ) : (
              <button className="mt-3 w-full rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                Connect Wallet
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-1 py-2">
              <ul className="space-y-1">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.path;

                  // For protected routes that require authentication
                  if (item.protected && !isConnected) {
                    return (
                      <li key={item.path}>
                        <button
                          className={cn(
                            "flex w-full items-center px-4 py-3 text-base",
                            isActive ? "font-bold" : ""
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center px-4 py-3 text-base",
                          isActive ? "font-bold" : ""
                        )}
                        onClick={() => handleNavClick(item.path)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Bottom Section - Account Switcher */}
          {isConnected && user && (
            <div className="mt-auto border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="mr-3 h-8 w-8">
                    <AvatarImage
                      src={user.avatar_url || "https://i.pravatar.cc/150"}
                      alt={user.display_name || "User"}
                    />
                    <AvatarFallback>
                      {user.display_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.display_name || "User"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @
                      {user.display_name?.toLowerCase().replace(/\s+/g, "_") ||
                        "user"}
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
