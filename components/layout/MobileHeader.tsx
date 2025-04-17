"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useWalletSheet } from "@/hooks/useWalletSheet";
import { useAccount, useSignMessage, useConfig } from "wagmi";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
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

// --- SIWE Sign-In Logic ---
// (Adapted from DesktopNavigation.tsx)
async function handleSignIn(
  address: `0x${string}` | undefined,
  chainId: number | undefined,
  signMessageAsync: ReturnType<typeof useSignMessage>["signMessageAsync"]
) {
  try {
    if (!address || !chainId) {
      console.error("[MobileSignIn] Address or chainId missing.");
      // Consider showing a toast or error message to the user
      return;
    }

    console.log("[MobileSignIn] Getting CSRF token...");
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      console.error("[MobileSignIn] Failed to get CSRF token.");
      // Show error
      return;
    }
    console.log(
      "[MobileSignIn] CSRF token obtained:",
      csrfToken.substring(0, 10) + "..."
    );

    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum to Base Buzz app.",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce: csrfToken,
    });

    console.log("[MobileSignIn] Requesting signature...");
    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    });
    console.log(
      "[MobileSignIn] Signature obtained:",
      signature.substring(0, 20) + "..."
    );

    console.log("[MobileSignIn] Calling signIn('credentials')...");
    const signInResponse = await signIn("credentials", {
      message: JSON.stringify(message),
      signature,
      redirect: false, // Let useSession handle state update
    });
    console.log("[MobileSignIn] signIn response:", signInResponse);

    if (signInResponse?.error) {
      console.error(
        "[MobileSignIn] Sign-in callback failed:",
        signInResponse.error
      );
      // Show error toast
    } else if (signInResponse?.ok) {
      console.log(
        "[MobileSignIn] Sign-in successful via credentials, session will update."
      );
      // Optionally show success toast
    } else if (!signInResponse) {
      console.error(
        "[MobileSignIn] signIn response was unexpectedly null/undefined"
      );
      // Show error toast
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("[MobileSignIn] Error in handleSignIn:", error);
    // Show error toast with 'message'
  } finally {
    console.log("[MobileSignIn] handleSignIn finished");
    // Potentially reset any loading state if added
  }
}
// --- End SIWE Sign-In Logic ---

// Define Header Variations
function getHeaderContent(
  pathname: string,
  goBack: () => void,
  session: any,
  sessionStatus: string,
  address: `0x${string}` | undefined,
  isConnected: boolean,
  chainId: number | undefined,
  signMessageAsync: ReturnType<typeof useSignMessage>["signMessageAsync"],
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
      right: (() => {
        if (sessionStatus === "authenticated" && isConnected && address) {
          // Wallet connected AND authenticated via SIWE
          return (
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
          );
        } else if (isConnected && address && sessionStatus !== "loading") {
          // Wallet connected BUT NOT authenticated via SIWE (and not loading)
          // Add a loading state for the signing process if desired
          return (
            <Button
              variant="default" // Or another variant to stand out
              size="sm"
              onClick={() => handleSignIn(address, chainId, signMessageAsync)}
              aria-label="Sign in with Ethereum"
            >
              Sign In
            </Button>
          );
        } else if (!isConnected && sessionStatus !== "loading") {
          // Wallet NOT connected (and not loading)
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={openWalletSheet} // Should trigger connect modal
              aria-label="Connect Wallet"
            >
              Connect Wallet
            </Button>
          );
        } else {
          // Loading state (either connecting wallet or checking session)
          // Render nothing or a skeleton/spinner
          return <div className="h-9 w-24"></div>; // Placeholder for size matching
        }
      })(),
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
  const { chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
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
    chain?.id,
    signMessageAsync,
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
