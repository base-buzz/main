"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import LeftNavigation from "./LeftNavigation";
import RightSidebar from "./RightSidebar";
import MobileHeader from "./MobileHeader";
import { useWalletSheet } from "@/hooks/useWalletSheet";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname() ?? "";
  const { isWalletSheetOpen } = useWalletSheet();

  // Determine if we're on the landing page
  const isLandingPage = pathname === "/";

  // Determine if we should show tabs on specific routes
  // const showTabs = pathname.startsWith("/home"); // Keep logic if needed by MobileHeader

  // Determine if we need to show the back button (e.g., on profile pages)
  // const showBackButton = ... // Keep logic if needed by MobileHeader

  // Remove padding logic - handled in app/layout.tsx
  // const mobileBottomPadding = !isLandingPage ? "pb-[49px] md:pb-0" : "";

  // Don't use the standard layout on the landing page
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div
      // Remove mobileBottomPadding from className
      className={cn(
        "min-h-screen",
        // mobileBottomPadding, // Removed
        isWalletSheetOpen ? "overflow-hidden" : ""
      )}
    >
      {/* Mobile layout: Render Header AND Children */}
      <div className="md:hidden">
        <MobileHeader pathname={pathname} />
        {/* Render page content for mobile view */}
        <main>{children}</main>
      </div>

      {/* Desktop layout: Render Nav, Children, Sidebar */}
      <div className="relative mx-auto hidden w-full max-w-[1290px] md:flex">
        <div className="sticky top-0 h-screen w-[275px] shrink-0">
          <LeftNavigation />
        </div>
        {/* Use the same main element tag for consistency */}
        <main className="min-h-screen w-full max-w-[600px] border-x border-border">
          {children}
        </main>
        <div className="sticky top-0 hidden h-screen w-[350px] shrink-0 overflow-y-auto pl-[25px] lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
