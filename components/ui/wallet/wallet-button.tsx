/**
 * @file components/ui/wallet/wallet-button.tsx
 * @description Button component for wallet connection actions
 *
 * WalletButton Component
 *
 * A client-side component that provides the main wallet connection interface.
 * Shows a "Connect Wallet" button when not connected, and a button with the
 * connected wallet address when connected. Includes copy functionality for the
 * wallet address and opens a wallet details sheet when clicked.
 */

"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { Copy, Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { WalletSheet } from "@/components/ui/wallet/wallet-sheet";
import Image from "next/image";
import React from "react";

export function WalletButton() {
  // Wagmi hook for wallet state
  const { address, isConnected } = useAccount();

  // Local state for wallet sheet visibility
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Custom hook for clipboard operations
  const { copy, copied } = useClipboard();

  // RainbowKit hook for opening the connect modal
  const { openConnectModal } = useConnectModal();

  // Handle hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="flex h-[44px] items-center gap-2 rounded-[10px] px-4 opacity-0"
      >
        <div className="rounded-[15px] bg-white/10 p-1">
          <div className="h-7 w-7" />
        </div>
        Loading...
      </Button>
    );
  }

  return (
    <>
      {isConnected ? (
        // Connected wallet state
        <Button
          variant="outline"
          style={
            {
              "--gradient-start": "#2563eb",
              "--gradient-end": "#3b82f6",
              background:
                "linear-gradient(to right, var(--gradient-start), var(--gradient-end))",
              backgroundSize: "200% auto",
              border: "none",
            } as React.CSSProperties
          }
          className="flex h-[44px] items-center gap-2 rounded-[10px] px-4 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
          onClick={() => setOpen(true)}
        >
          {/* Wallet avatar */}
          <div className="rounded-[15px] bg-white/10 p-1">
            <Image
              src="/avatars/01.png"
              alt="Wallet Avatar"
              width="28"
              height="28"
              className="h-7 w-7 rounded-full"
            />
          </div>
          {/* Truncated wallet address */}
          <span className="max-w-[100px] truncate">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          {/* Copy button with success state */}
          <div
            className="relative flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              copy(address ?? "");
            }}
          >
            {copied ? (
              <Check className="h-4 w-4 text-white opacity-100 transition-opacity" />
            ) : (
              <Copy className="h-4 w-4 text-white/70 opacity-0 transition-opacity hover:opacity-100" />
            )}
          </div>
        </Button>
      ) : (
        // Disconnected wallet state
        <Button
          variant="default"
          style={
            {
              "--gradient-start": "#2563eb",
              "--gradient-end": "#3b82f6",
              background:
                "linear-gradient(to right, var(--gradient-start), var(--gradient-end))",
              backgroundSize: "200% auto",
              border: "none",
            } as React.CSSProperties
          }
          className="flex h-[44px] items-center gap-2 rounded-[10px] px-4 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
          onClick={() => openConnectModal?.()}
        >
          <div className="rounded-[15px] bg-white/10 p-1">
            <Wallet className="h-7 w-7" />
          </div>
          Connect Wallet
        </Button>
      )}

      {/* Wallet details sheet */}
      {isConnected && <WalletSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
