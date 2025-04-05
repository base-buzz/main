"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useWalletSheet } from "@/hooks/useWalletSheet";
import MobileSheetNav from "./MobileSheetNav";
import { useAccount } from "wagmi";
import { WalletSheet } from "@/components/ui/wallet/wallet-sheet";
import { HomeTabs } from "@/components/home/HomeTabs";

interface Tab {
  id: string;
  label: string;
  path: string;
}

// MOVE defaultTabs definition outside the component
const defaultTabs: Tab[] = [
  { id: "for-you", label: "For you", path: "/home" },
  { id: "following", label: "Following", path: "/home/following" },
  { id: "buildin", label: "Buildin", path: "/home/buildin" },
  { id: "canto", label: "Canto", path: "/home/canto" },
];

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { isWalletSheetOpen, openWalletSheet, closeWalletSheet } =
    useWalletSheet();

  const currentTabs = defaultTabs;
  const [activeTab, setActiveTab] = useState(currentTabs[0].id);

  // Update active tab based on pathname
  useEffect(() => {
    // Add null check/default value
    const currentPath = pathname || "/home";
    const matchingTab = currentTabs.find((tab) => currentPath === tab.path);
    if (matchingTab) {
      setActiveTab(matchingTab.id);
    } else {
      // Default to first tab if no match
      setActiveTab(currentTabs[0].id);
    }
  }, [pathname, currentTabs]);

  // Handle goBack
  const goBack = () => {
    router.back();
  };

  // Don't render on landing page
  // Add null check/default value
  const currentPathForRenderCheck = pathname || "/home";
  if (currentPathForRenderCheck === "/") return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <MobileSheetNav />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
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
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <button
              onClick={openWalletSheet}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <span>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </button>
          ) : (
            <button
              onClick={openWalletSheet}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <WalletSheet open={isWalletSheetOpen} onOpenChange={closeWalletSheet} />

      {/* Show tabs for home routes */}
      {(pathname || "/home").startsWith("/home") && <HomeTabs />}
    </header>
  );
}
