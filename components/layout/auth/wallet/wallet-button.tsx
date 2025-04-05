/**
 * @file components/layout/auth/wallet/wallet-button.tsx
 * @description Button component for wallet connection actions in auth layout
 */

"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { Copy, Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { WalletSheet } from "./wallet-sheet";
import Image from "next/image";

export function WalletButton() {
  // Wagmi hook for wallet state
  const { address, isConnected } = useAccount();

  // Local state for wallet sheet visibility
  const [open, setOpen] = useState(false);

  // Custom hook for clipboard operations
  const { copy, copied } = useClipboard();

  // RainbowKit hook for opening the connect modal
  const { openConnectModal } = useConnectModal();

  return (
    <>
      {isConnected ? (
        // Connected wallet state
        <Button
          variant="outline"
          className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#536471]/25 bg-white text-[15px] font-medium leading-5 text-[#3c4043] transition-colors hover:bg-[#e6e6e6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]"
          onClick={() => setOpen(true)}
        >
          {/* Wallet avatar */}
          <Image
            src="/avatars/01.png"
            alt="Wallet Avatar"
            width="10"
            height="10"
            className="h-5 w-5 rounded-full"
          />
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
              <Check className="h-4 w-4 text-green-500 opacity-100 transition-opacity" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500 opacity-0 transition-opacity hover:opacity-100" />
            )}
          </div>
        </Button>
      ) : (
        // Disconnected wallet state - using our custom styling
        <div className="mt-8 flex w-full flex-col space-y-3 lg:mt-[40px] lg:max-w-[300px] lg:space-y-[12px]">
          <button
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#536471]/25 bg-white text-[15px] font-medium leading-5 text-[#3c4043] transition-colors hover:bg-[#e6e6e6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]"
            onClick={() => openConnectModal?.()}
          >
            <div className="rounded-[15px] bg-white p-1">
              <Image
                src="/coinbase.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
                aria-hidden="true"
              />
            </div>
            Sign up with Coinbase
          </button>
          <button
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#536471]/25 bg-white text-[15px] font-medium leading-5 text-[#000000] transition-colors hover:bg-[#e6e6e6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]"
            onClick={() => openConnectModal?.()}
          >
            <div className="rounded-[15px] bg-white p-1">
              <Image
                src="/metamask.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
                aria-hidden="true"
              />
            </div>
            Sign up with MetaMask
          </button>

          <div
            className="flex items-center justify-center py-0.5"
            role="separator"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-[#536471]/25"></div>
            <span className="mx-2 text-[15px] text-[#536471]">or</span>
            <div className="h-px flex-1 bg-[#536471]/25"></div>
          </div>

          <button
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#FF0080] bg-[length:200%_auto] px-8 py-2 font-medium text-white transition-colors duration-200 hover:bg-right"
            onClick={() => openConnectModal?.()}
          >
            <div className="rounded-[15px] bg-white/10 p-1">
              <Image
                src="/wallet-connect.svg"
                alt="Wallet Connect"
                width={28}
                height={28}
                className="h-7 w-7"
              />
            </div>
            Wallet Connect
          </button>
        </div>
      )}

      {/* Wallet details sheet */}
      {isConnected && <WalletSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
