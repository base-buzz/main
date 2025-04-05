"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define tabs outside the component
const TABS = [
  { id: "for-you", label: "For you", path: "/home" },
  { id: "following", label: "Following", path: "/home?tab=following" },
  { id: "buildin", label: "Buildin", path: "/home?tab=buildin" },
  { id: "web3", label: "Web3", path: "/home?tab=web3" },
];

export function HomeTabs() {
  const pathname = usePathname();
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const currentTab = searchParams.get("tab") || "for-you";

  return (
    <div className="flex w-full border-b border-border">
      {TABS.map((tab) => {
        const isActive =
          tab.id === currentTab || (tab.id === "for-you" && !currentTab);

        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={cn(
              "flex flex-1 items-center justify-center border-b-2 border-transparent px-4 py-2 font-medium transition-colors hover:bg-muted/50",
              isActive && "border-[#1d9bf0] text-[#1d9bf0]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
