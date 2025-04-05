/**
 * @file components/ui/wallet/wallet-connected.tsx
 * @description Component for displaying connected wallet information and actions
 *
 * WalletConnected Component
 *
 * A client-side component that displays detailed wallet information in a slide-out sheet.
 * Shows wallet address, balance, network information, and provides actions like
 * copying address, viewing on explorer, and disconnecting the wallet.
 */

"use client";

import * as React from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const WalletConnected = () => {
  // Custom hook for toast notifications
  const { toast } = useToast();

  // Wagmi hooks for wallet state and actions
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  // State for controlling sheet visibility
  const [open, setOpen] = React.useState(false);

  /**
   * Copies the wallet address to clipboard and shows a toast notification
   */
  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard.",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger button showing truncated address */}
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "Connect Wallet"}
        </Button>
      </SheetTrigger>

      {/* Slide-out sheet content */}
      <SheetContent side="right" className="w-[350px] p-4">
        <h2 className="text-center text-lg font-semibold">Wallet</h2>

        {isConnected && address ? (
          <div className="mt-4 space-y-4">
            {/* Wallet address section with copy button */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm font-medium">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>

            {/* Balance and network information */}
            <div className="rounded-md bg-muted p-3 text-center">
              <p className="text-sm">
                Balance: {balance?.formatted} {balance?.symbol}
              </p>
              <p className="text-xs text-muted-foreground">
                Network: {chain?.name ?? "Unknown"} (ID: {chain?.id})
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {/* View on BaseScan button */}
              <Button
                variant="outline"
                className="flex w-full items-center justify-between"
                onClick={() =>
                  window.open(
                    `https://basescan.org/address/${address}`,
                    "_blank",
                  )
                }
              >
                View on Explorer <ExternalLink className="h-4 w-4" />
              </Button>

              {/* Disconnect wallet button */}
              <Button
                variant="destructive"
                className="flex w-full items-center justify-between"
                onClick={() => disconnect()}
              >
                Disconnect <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // No wallet connected state
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No wallet connected.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Export component and sheet control function for external use
export { WalletConnected };
export let setWalletSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;

export default WalletConnected;
