/**
 * @file components/ui/wallet/wallet-sheet.tsx
 * @description Wallet sheet component for displaying wallet connection and network information
 *
 * A detailed wallet information sheet that displays:
 * - Wallet address with copy functionality
 * - On-chain data (ETH balance, BUZZ token balance)
 * - Network information
 * - ENS name
 * - Various metrics (badges, reputation, FOMO score)
 * - Debug information and wallet disconnection
 */

import { useAccount, useDisconnect, useBalance, useConfig } from "wagmi";
import { switchNetwork } from "wagmi/actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { formatEther } from "viem";
import { useEffect, useState } from "react";
import { useEnsName } from "wagmi";
import { base, baseGoerli } from "wagmi/chains";
import { Icons } from "@/components/icons";

interface WalletSheetProps {
  /** Controls the open state of the sheet */
  open: boolean;
  /** Callback function to handle sheet open state changes */
  onOpenChange: (open: boolean) => void;
}

// Constants for token addresses
const BASE_ETH_ADDRESS = "0x4200000000000000000000000000000000000006";
// eslint-disable-next-line turbo/no-undeclared-env-vars
const BUZZ_ADDRESS = process.env.NEXT_PUBLIC_BUZZ_TOKEN_ADDRESS;
const isBuzzTokenValid =
  BUZZ_ADDRESS?.startsWith("0x") && BUZZ_ADDRESS.length === 42;

export function WalletSheet({ open, onOpenChange }: WalletSheetProps) {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { copy, copied } = useClipboard();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { data: ensName } = useEnsName({ address });
  const config = useConfig();

  // Fetch BUZZ token balance
  const buzzBalanceResult = useBalance({
    address,
    token: isBuzzTokenValid ? (BUZZ_ADDRESS as `0x${string}`) : undefined,
  });
  const buzzBalance = buzzBalanceResult.data;

  // State for ETH price
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  // Debug logging for balance updates
  useEffect(() => {
    console.log("WalletSheet: buzzBalanceResult", buzzBalanceResult);
    console.log("WalletSheet: buzzBalance", buzzBalance);
  }, [buzzBalanceResult, buzzBalance]);

  // Debug logging for chain and ENS updates
  useEffect(() => {
    console.log("WalletSheet: chain", chain);
    console.log("WalletSheet: ensName", ensName);
  }, [chain, ensName]);

  /**
   * Fetches token price from CoinGecko API
   * @param tokenAddress - The token contract address
   * @returns The token price in USD or null if fetch fails
   */
  const getTokenPrice = async (tokenAddress: string) => {
    try {
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      const url = `${process.env.NEXT_PUBLIC_COINGECKO_BASE_TOKEN_API}?contract_addresses=${tokenAddress}&vs_currencies=usd`;
      const res = await fetch(url);
      const data = await res.json();

      console.log("Fetched token price data from Coingecko:", data);
      return data[tokenAddress.toLowerCase()]?.usd ?? null;
    } catch (error) {
      console.error("Failed to fetch token price", error);
      return null;
    }
  };

  // Fetch ETH price on component mount
  useEffect(() => {
    getTokenPrice(BASE_ETH_ADDRESS.toLowerCase()).then(setEthPrice);
  }, []);

  const handleCopy = () => {
    if (address) {
      copy(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Wallet</SheetTitle>
        </SheetHeader>

        {isConnected && address ? (
          <div className="mt-6 space-y-6">
            {/* Profile Section */}
            {user && (
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.display_name}</p>
                  <Link
                    href="/settings/profile"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-sm">
                  {balance?.formatted} {balance?.symbol}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() =>
                  window.open(
                    `https://basescan.org/address/${address}`,
                    "_blank"
                  )
                }
              >
                View on Explorer
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                variant="destructive"
                className="w-full justify-between"
                onClick={() => {
                  disconnect();
                  onOpenChange(false);
                }}
              >
                Disconnect
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Please connect your wallet
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
