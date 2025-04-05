/**
 * @file components/ui/wallet/wallet-connect.tsx
 * @description Main wallet connection component
 *
 * WalletConnect Component
 *
 * A client-side component that handles wallet connection and display.
 * Shows a button with the connected wallet address when connected,
 * and opens a sheet with wallet details when clicked.
 */

"use client";

import * as React from "react";
import { Wallet, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useClipboard } from "@/hooks/use-clipboard"; // Custom hook for clipboard operations
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { WalletSheet } from "@/components/ui/wallet/wallet-sheet";

interface WalletConnectProps {
  /** Controls the open state of the wallet sheet */
  open: boolean;
  /** Callback function to handle sheet open state changes */
  onOpenChange: (state: boolean) => void;
}

export function WalletConnect({ open, onOpenChange }: WalletConnectProps) {
  // RainbowKit hook for opening the connect modal
  const { openConnectModal } = useConnectModal();

  // Wagmi hooks for wallet state management
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  // Custom hook for clipboard operations
  const { copy, copied } = useClipboard();

  return (
    <>
      {isConnected && address ? (
        // Sheet component for displaying wallet details
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="relative flex items-center gap-2 transition hover:bg-muted"
              onClick={() => onOpenChange(true)}
            >
              <Wallet className="h-5 w-5" />
              {/* Wallet address display with copy functionality */}
              <div className="group relative">
                <span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <Copy
                  className="absolute right-[-20px] top-[2px] h-4 w-4 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => copy(address)}
                />
              </div>
            </Button>
          </SheetTrigger>
          {/* Sheet content with wallet details */}
          <SheetContent>
            <WalletSheet open={open} onOpenChange={onOpenChange} />
          </SheetContent>
        </Sheet>
      ) : null}{" "}
      {/* Wallet connection is handled by WalletButton component */}
    </>
  );
}

export default WalletConnect;
