"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useWalletSheet } from "@/hooks/useWalletSheet";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { WalletSheet } from "@/components/ui/wallet/wallet-sheet";
import { HomeTabs } from "@/components/home/HomeTabs";
import {
  ArrowLeft,
  Settings,
  Search,
  Upload,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SideMenuContent from "./SideMenuContent";

// Define expected return type for the function
interface HeaderContent {
  left: React.ReactNode | null;
  center: React.ReactNode | null;
  right: React.ReactNode | null;
  showTabs: boolean;
}

// Define Header Variations
function getHeaderContent(
  pathname: string,
  goBack: () => void,
  session: any,
  sessionStatus: string,
  address: `0x${string}` | undefined,
  isConnected: boolean,
  openWalletSheet: () => void
): HeaderContent {
  // Home Feed ('/home', '/home/following', etc.)
  if (pathname.startsWith("/home")) {
    const userImageUrl = session?.user?.image;
    const userHandle = session?.user?.handle;
    const isLoading = sessionStatus === "loading";

    const leftContent = isLoading ? (
      <Skeleton className="h-8 w-8 rounded-full" />
    ) : userHandle ? (
      <SheetTrigger asChild>
        <button aria-label="Open side menu" className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userImageUrl} alt="User Avatar" />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
    ) : (
      <div className="h-8 w-8" />
    );

    return {
      left: leftContent,
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
      right:
        isConnected && address ? (
          <Button
            variant="outline"
            size="sm"
            onClick={openWalletSheet}
            aria-label="Open wallet sheet"
            className="flex items-center gap-1.5"
          >
            <Wallet className="h-4 w-4" />
            <span>{truncateAddress(address)}</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={openWalletSheet}>
            Connect Wallet
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
    const content: HeaderContent = {
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
    return content;
  }

  // Post Detail View ('/post/[id]')
  if (pathname.startsWith("/post/")) {
    const content: HeaderContent = {
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
    return content;
  }

  // Notifications ('/notifications')
  if (pathname === "/notifications") {
    const content: HeaderContent = {
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
    return content;
  }

  // Messages ('/messages')
  if (pathname === "/messages") {
    const content: HeaderContent = {
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
    return content;
  }

  // Edit Profile, Compose ('/profile/edit', '/compose') - Needs specific paths
  // TODO: Add cases for Edit Profile, Compose, Settings, etc.
  // Default / Fallback Header (e.g., simple back button)
  const content: HeaderContent = {
    left: (
      <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
    ),
    center: null,
    right: null,
    showTabs: false,
  };
  return content;
}

interface MobileHeaderProps {
  pathname: string;
}

export default function MobileHeader({ pathname }: MobileHeaderProps) {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { data: session, status: sessionStatus } = useSession();
  const { isWalletSheetOpen, openWalletSheet, closeWalletSheet } =
    useWalletSheet();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const goBack = () => {
    router.back();
  };

  if (pathname === "/") return null;

  const { left, center, right, showTabs } = getHeaderContent(
    pathname,
    goBack,
    session,
    sessionStatus,
    address,
    isConnected,
    openWalletSheet
  );

  return (
    <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex flex-1 justify-start">{left}</div>
          <div>{center}</div>
          <div className="flex flex-1 justify-end">{right}</div>
        </div>
        {showTabs && <HomeTabs />}
      </header>

      <SheetContent side="left" className="w-[80%] max-w-sm p-0">
        <SideMenuContent />
      </SheetContent>

      <WalletSheet open={isWalletSheetOpen} onOpenChange={closeWalletSheet} />
    </Sheet>
  );
}
