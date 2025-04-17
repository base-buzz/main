"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define tabs outside the component
const TABS = [
  { id: "for-you", label: "For you", path: "/home" },
  { id: "following", label: "Following", path: "/home?tab=following" },
  {
    id: "buildinpublic",
    label: "BuildinPublic",
    path: "/home?tab=buildinpublic",
  },
  { id: "canto", label: "Canto", path: "/home?tab=canto" },
  { id: "base-c", label: "Base C", path: "/home?tab=base-c" },
  // Add more tabs here if needed following the pattern
];

export function HomeTabs() {
  const pathname = usePathname();
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  // Default to 'for-you' if no tab param or if param is invalid
  const currentTabParam = searchParams.get("tab");
  const currentTab =
    TABS.find((t) => t.id === currentTabParam)?.id || "for-you";

  return (
    // Add scrolling container
    <div className="w-full border-b border-border overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex justify-start md:justify-around">
        {" "}
        {/* Adjust alignment */}
        {TABS.map((tab) => {
          const isActive = tab.id === currentTab;

          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={cn(
                // Remove flex-1, add padding/margin for spacing
                "relative inline-flex items-center justify-center px-4 py-3 font-medium transition-colors hover:bg-muted/50 shrink-0",
                // Ensure sufficient horizontal padding for touch targets
                "sm:px-6",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 h-1 w-14 rounded-full bg-blue-500"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
