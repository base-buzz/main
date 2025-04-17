"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useWalletSheet } from "@/hooks/useWalletSheet";
import { useAccount } from "wagmi";
import { WalletSheet } from "@/components/ui/wallet/wallet-sheet";
import { HomeTabs } from "@/components/home/HomeTabs";
import {
  ArrowLeft,
  Settings,
  Search,
  Upload,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define Header Variations
function getHeaderContent(pathname: string, goBack: () => void) {
  // Home Feed ('/home', '/home/following', etc.)
  if (pathname.startsWith("/home")) {
    return {
      left: null,
      center: (
        <Link href="/home" className="flex items-center">
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
      ),
      right: (
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
      ),
      showTabs: true,
    };
  }

  // Profile View ('/[handle]')
  if (
    pathname.startsWith("/") &&
    pathname.split("/").length === 2 &&
    pathname !== "/"
  ) {
    return {
      left: (
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ),
      center: null,
      right: (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      ),
      showTabs: false,
    };
  }

  // Post Detail View ('/post/[id]')
  if (pathname.startsWith("/post/")) {
    return {
      left: (
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      ),
      center: <h1 className="text-lg font-semibold">Post</h1>,
      right: (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Share post">
            <Upload className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      ),
      showTabs: false,
    };
  }

  // Notifications ('/notifications')
  if (pathname === "/notifications") {
    return {
      left: (
        <button aria-label="Open menu" className="p-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.png" alt="User Avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </button>
      ),
      center: <h1 className="text-lg font-semibold">Notifications</h1>,
      right: (
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      ),
      showTabs: false,
    };
  }

  // Messages ('/messages')
  if (pathname === "/messages") {
    return {
      left: (
        <button aria-label="Open menu" className="p-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.png" alt="User Avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </button>
      ),
      center: <h1 className="text-lg font-semibold">Messages</h1>,
      right: (
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      ),
      showTabs: false,
    };
  }

  // Edit Profile, Compose ('/profile/edit', '/compose') - Needs specific paths
  // TODO: Add cases for Edit Profile, Compose, Settings, etc.
  // Default / Fallback Header (e.g., simple back button)
  return {
    left: (
      <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
    ),
    center: null,
    right: null,
    showTabs: false,
  };
}

interface MobileHeaderProps {
  pathname: string;
}

export default function MobileHeader({ pathname }: MobileHeaderProps) {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { isWalletSheetOpen, openWalletSheet, closeWalletSheet } =
    useWalletSheet();

  const goBack = () => {
    router.back();
  };

  if (pathname === "/") return null;

  const { left, center, right, showTabs } = getHeaderContent(pathname, goBack);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex flex-1 justify-start">{left}</div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {center}
        </div>

        <div className="flex flex-1 justify-end">{right}</div>
      </div>

      {showTabs && <HomeTabs />}

      <WalletSheet open={isWalletSheetOpen} onOpenChange={closeWalletSheet} />
    </header>
  );
}
