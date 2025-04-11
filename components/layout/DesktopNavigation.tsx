"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
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
import { useAccount, useSignMessage } from "wagmi";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { NavIcon } from "@/components/ui/nav-icon";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

// --- SIWE / NextAuth Imports --- //
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { signIn, signOut, useSession, getCsrfToken } from "next-auth/react";
import { Button } from "@/components/ui/button";
// --- End SIWE / NextAuth Imports --- //

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
  const { address, chainId, isConnected } = useAccount();
  const { unreadCount } = useUnreadMessages();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // --- SIWE / NextAuth State & Handlers --- //
  const { data: session, status } = useSession();
  const { signMessageAsync } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // ** WARNING: Critical Auth Logic - SIWE Sign-In Handler **
  // (Copied EXACTLY from AUTH.md - DO NOT MODIFY CORE LOGIC)
  const handleSignIn = async () => {
    if (!address || !chainId) {
      console.error("[CLIENT] Wallet not connected or chainId missing");
      setSignInError("Please connect your wallet first.");
      return;
    }

    setIsSigningIn(true);
    setSignInError(null);
    console.log("[CLIENT] handleSignIn started for address:", address);

    try {
      console.log("[CLIENT] Fetching CSRF token...");
      // 1. Fetch CSRF token from NextAuth to use as nonce
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        console.error("[CLIENT] Failed to fetch CSRF token");
        throw new Error("Failed to fetch CSRF token for SIWE nonce.");
      }
      console.log(
        "[CLIENT] CSRF token obtained:",
        csrfToken.substring(0, 10) + "..."
      );

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to Base Buzz app.", // Customize statement
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce: csrfToken, // Nonce MUST be the CSRF token
      });

      console.log("[CLIENT] Requesting signature...");
      // 3. Request signature from user's wallet
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      console.log(
        "[CLIENT] Signature obtained:",
        signature.substring(0, 20) + "..."
      );

      console.log("[CLIENT] Calling signIn('credentials')...");
      // 4. Send message and signature to NextAuth Credentials provider
      const signInResponse = await signIn("credentials", {
        message: JSON.stringify(message), // Send full message
        signature,
        redirect: false, // Handle redirect manually based on response/useEffect
      });
      console.log("[CLIENT] signIn response:", signInResponse);

      if (signInResponse?.error) {
        console.error(
          "[CLIENT] Sign-in callback failed:",
          signInResponse.error
        );
        setSignInError(`Sign-in failed: ${signInResponse.error}`);
      } else if (signInResponse?.ok) {
        // Session will update via useSession hook, useEffect can handle redirects
        console.log(
          "[CLIENT] Sign-in successful via credentials, session will update."
        );
      } else if (!signInResponse) {
        console.error(
          "[CLIENT] signIn response was unexpectedly null/undefined"
        );
        setSignInError("Sign-in process did not complete as expected.");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      console.error("[CLIENT] Error in handleSignIn:", error);
      setSignInError(message);
    } finally {
      setIsSigningIn(false);
      console.log("[CLIENT] handleSignIn finished");
    }
  };

  // Sign out handler
  // (Copied EXACTLY from AUTH.md - DO NOT MODIFY CORE LOGIC)
  const handleSignOut = async () => {
    console.log("[CLIENT] handleSignOut started");
    await signOut({ redirect: false }); // Let page state update via useSession
    console.log("[CLIENT] signOut called, session should clear");
  };
  // --- End SIWE / NextAuth State & Handlers --- //

  // Replace old user data with session data
  // const user = session?.user; // Use session data directly where needed

  // Disable links based on NextAuth status
  const isAuthRequiredAndNotLoggedIn = (requiresAuth?: boolean) => {
    return requiresAuth && status !== "authenticated";
  };

  // Log state just before render completes
  // console.log("[DesktopNavigation Pre-Return]", {
  //   isConnected,
  //   status,
  //   session,
  //   pathname,
  // });

  return (
    <nav className={cn("flex h-screen flex-col bg-background px-3", className)}>
      {/* Logo - Fixed at top */}
      <Link
        href="/home"
        className="flex h-14 w-14 items-center justify-center rounded-full hover:bg-accent/10"
      >
        <Image
          src="/logo.svg"
          alt="BaseBuzz"
          width={32}
          height={32}
          className="dark:invert"
        />
      </Link>

      {/* Scrollable Navigation Items - Updated Link/Button logic */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            // Determine the correct href for the profile link
            let finalHref = item.href;
            if (
              item.label === "Profile" &&
              status === "authenticated" &&
              session?.user?.handle
            ) {
              finalHref = `/${session.user.handle}`;
            }

            const currentPath = pathname || "/home";
            const isActive =
              currentPath === finalHref || // Use finalHref for isActive check
              (finalHref !== "/" && currentPath.startsWith(finalHref + "/")); // Adjust startswith check slightly

            const Icon = isActive ? item.activeIcon : item.icon;

            // Use NextAuth status to disable links
            if (isAuthRequiredAndNotLoggedIn(item.requiresAuth)) {
              return (
                <button
                  key={item.href}
                  disabled
                  className={cn(
                    "group flex min-w-[200px] cursor-not-allowed items-center gap-4 rounded-full p-3 opacity-50", // Style disabled links
                    isActive && "font-bold"
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
                href={finalHref}
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
        {/* Post Button - Disable if not authenticated */}
        <div className="mb-4 px-2">
          <Link
            href="/compose"
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-full font-bold text-white transition-colors",
              status === "authenticated"
                ? "bg-[#1d9bf0] hover:bg-[#1a8cd8] dark:bg-blue-600 dark:hover:bg-blue-700"
                : "cursor-not-allowed bg-muted opacity-50"
            )}
            aria-disabled={status !== "authenticated"}
            onClick={(e) => {
              if (status !== "authenticated") {
                e.preventDefault(); // Prevent navigation if not authenticated
              }
            }}
          >
            Post
          </Link>
        </div>

        {/* Updated Profile/Auth Section */}
        <div className="border-t border-border">
          <div className="py-3">
            {status === "loading" && (
              <div className="flex h-[68px] items-center justify-center text-muted-foreground">
                Loading...
              </div>
            )}

            {!isConnected && status !== "loading" && (
              <div className="flex items-center justify-center p-3">
                {/* Use RainbowKit ConnectButton when wallet disconnected */}
                <ConnectButton />
              </div>
            )}

            {isConnected && status === "unauthenticated" && (
              <div className="flex flex-col items-center gap-2 p-3">
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full"
                >
                  {isSigningIn ? "Signing In..." : "Sign In With Ethereum"}
                </Button>
                {signInError && (
                  <p className="text-xs text-destructive">
                    Error: {signInError}
                  </p>
                )}
                {/* Optionally show ConnectButton to allow switching wallet */}
                {/* <ConnectButton /> */}
              </div>
            )}

            {status === "authenticated" && (
              <div className="group flex w-full items-center gap-3 rounded-full p-3 transition-all duration-200 ease-in-out hover:bg-muted hover:shadow-sm dark:hover:bg-gray-800">
                {/* Existing profile display */}
                <button
                  onClick={() =>
                    setTimeout(() => setIsEditProfileOpen(true), 0)
                  } // Defer state update
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-accent">
                    <Image
                      src={session?.user?.image || "/default-avatar.png"} // Use session image if available
                      alt={session?.user?.name || "Profile"} // Use session name if available
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold leading-5 text-foreground">
                      {session?.user?.name ||
                        session?.user?.handle ||
                        "Anonymous"}{" "}
                      {/* Prioritize name, then handle */}
                    </div>
                    <div className="truncate text-sm text-muted-foreground">
                      @
                      {session?.user?.handle ||
                        session?.user?.address?.slice(0, 8) ||
                        "anon"}{" "}
                      {/* Prioritize handle, then address */}
                    </div>
                  </div>
                </button>
                {/* Sign Out Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="ml-auto"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog (existing) */}
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </nav>
  );
}
