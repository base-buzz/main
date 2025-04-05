"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import LeftNavigation from "./LeftNavigation";
import RightSidebar from "./RightSidebar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
import { useWalletSheet } from "@/hooks/useWalletSheet";
import MobileLayout from "./MobileLayout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { isWalletSheetOpen } = useWalletSheet();

  // Determine if we're on the landing page
  const isLandingPage = pathname === "/";

  // Determine if we should show tabs on specific routes
  const showTabs = pathname.startsWith("/home");

  // Determine if we need to show the back button (e.g., on profile pages)
  const showBackButton =
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/post/") ||
    pathname === "/settings" ||
    pathname === "/notifications" ||
    pathname === "/messages";

  // Add extra padding at the bottom on mobile for the navigation bar
  const mobileBottomPadding = !isLandingPage ? "pb-[49px] md:pb-0" : "";

  // Don't use the standard layout on the landing page
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div
      // Restore original className
      className={cn(
        "min-h-screen",
        mobileBottomPadding,
        isWalletSheetOpen ? "overflow-hidden" : ""
      )}
      // Temporarily simplify classes
      // className="min-h-screen"
    >
      {/* Mobile layout */}
      <div className="md:hidden">
        <MobileLayout>
          <MobileHeader />
          {!isLandingPage && <MobileBottomNav />}
        </MobileLayout>
      </div>

      {/* Twitter-like 3-column layout */}
      <div className="relative mx-auto hidden w-full max-w-[1290px] md:flex">
        {/* Left column - Navigation (hidden on mobile) */}
        <div className="sticky top-0 h-screen w-[275px] shrink-0">
          <LeftNavigation />
        </div>

        {/* Center column - Main content */}
        <main className="min-h-screen w-full max-w-[600px] border-x border-border">
          {children}
        </main>

        {/* Right column - Sidebar (hidden on mobile and smaller tablets) */}
        <div className="sticky top-0 hidden h-screen w-[350px] shrink-0 overflow-y-auto pl-[25px] lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
