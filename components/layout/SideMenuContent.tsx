"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/lib/utils";
import {
  UserPlus, // Icon for adding friend (placeholder)
  User, // Profile
  X, // Premium (placeholder)
  Users, // Communities
  Bookmark, // Bookmarks
  Briefcase, // Jobs
  List, // Lists
  Mic2, // Spaces (placeholder)
  DollarSign, // Monetization
  Download, // Download Grok
  Settings, // Settings
  Sun, // Theme (placeholder)
  LogOut, // Sign Out
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NAV_ITEMS } from "@/components/layout/DesktopNavigation"; // Import NAV_ITEMS
import { cn } from "@/lib/utils"; // Import cn

// Define props for the component
interface SideMenuContentProps {
  closeSideMenu: () => void; // Function to close the parent sheet
}

// TODO: Fetch follower/following counts
// TODO: Implement actual navigation links and actions
// TODO: Add Theme switcher logic

export default function SideMenuContent({
  closeSideMenu,
}: SideMenuContentProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" }); // Redirect to landing after sign out
  };

  // Placeholder counts
  const followingCount = 2433;
  const followersCount = 5782;

  return (
    <ScrollArea className="h-full">
      <div className="flex h-full flex-col p-4">
        {/* User Info Section */}
        <div className="mb-4 border-b pb-4">
          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full mb-2" />
          ) : (
            <div className="flex items-center justify-between">
              <Link
                href={`/${user?.handle || "#"}`}
                className="block"
                onClick={closeSideMenu} // Close menu on click
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-32 mt-2" />
              <Skeleton className="h-4 w-24 mt-1" />
            </>
          ) : user ? (
            <div className="mt-2">
              <p className="font-semibold">{user?.name || "User Name"}</p>
              <p className="text-sm text-muted-foreground">
                @{user?.handle || truncateAddress(user?.address ?? undefined)}
              </p>
            </div>
          ) : null}
          {isLoading ? (
            <Skeleton className="h-4 w-40 mt-3" />
          ) : user ? (
            <div className="mt-3 flex space-x-4 text-sm">
              <span>
                <span className="font-semibold">{followingCount}</span>{" "}
                Following
              </span>
              <span>
                <span className="font-semibold">{followersCount}</span>{" "}
                Followers
              </span>
            </div>
          ) : null}
        </div>

        {/* Main Navigation Links - Use NAV_ITEMS */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            // Skip auth-required items if not logged in
            if (item.requiresAuth && status !== "authenticated") {
              return null;
            }

            const href =
              item.label === "Profile"
                ? `/${user?.handle || "#"}` // Use user handle for profile link
                : item.href;

            const IconComponent = item.icon; // Use the standard icon

            return (
              <Link
                key={item.label}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium hover:bg-accent"
                onClick={closeSideMenu} // Close menu on click
              >
                <IconComponent className="h-6 w-6 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section Links */}
        <div className="mt-auto border-t pt-4">
          <nav className="space-y-1">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-md px-3 py-2 font-medium hover:bg-accent"
              onClick={closeSideMenu} // Close menu on click
            >
              <Download className="h-5 w-5" />
              <span>Download Grok</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 font-medium hover:bg-accent"
              onClick={closeSideMenu} // Close menu on click
            >
              <Settings className="h-5 w-5" />
              <span>Settings and privacy</span>
            </Link>
            {/* Add Theme switcher here */}
            <Button
              variant="ghost"
              onClick={() => {
                handleSignOut();
                closeSideMenu(); // Close menu on sign out too
              }}
              className="w-full justify-start px-3 font-medium"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </ScrollArea>
  );
}
