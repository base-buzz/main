"use client";

import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Icon } from "@/components/ui/icons";
import { CheckIcon, CopyIcon, ExternalLinkIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useTokenPrice } from "@/hooks/useTokenPrice";

interface WalletProfileSheetProps {
  children: React.ReactNode;
  address?: string;
  isOwnWallet?: boolean;
}

export default function WalletProfileSheet({
  children,
  address,
  isOwnWallet = true,
}: WalletProfileSheetProps) {
  const { address: connectedAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [copied, setCopied] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const buzzTokenAddress = "0x2C74B18e2f84B78ac67428d0c7a9898515f0c46f"; // Replace with actual BUZZ token address
  const { price: buzzPrice, loading: priceLoading } =
    useTokenPrice(buzzTokenAddress);

  const walletAddress = address || connectedAddress;
  const formattedAddress = walletAddress
    ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(
        walletAddress.length - 4
      )}`
    : "";

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    // router.push("/"); // Remove explicit redirect on disconnect
  };

  // Mock data for the wallet profile
  const walletData = {
    buzzBalance: "1,245",
    totalTrades: 32,
    nftRanks: ["Gold", "Silver"],
    lastActive: "2 hours ago",
    connectedApps: ["Buzz", "Rugtron"],
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </SheetTrigger>
      <SheetContent side="right" className="max-w-[400px] overflow-y-auto p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between space-x-4 border-b border-border bg-background p-6">
            <SheetClose className="absolute left-4 top-4 rounded-full p-2 hover:bg-accent">
              <X className="h-4 w-4" />
            </SheetClose>
            <div className="ml-8 flex-1">
              <h2 className="text-2xl font-bold">
                {user?.display_name || "Wallet"}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                <span>{formattedAddress}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 rounded-full p-0"
                  onClick={copyToClipboard}
                  title="Copy address"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Avatar className="h-16 w-16 border-2 border-background">
              <AvatarImage
                src={user?.avatar_url || "https://i.pravatar.cc/150?img=3"}
                alt="Profile"
              />
              <AvatarFallback>
                {user?.display_name?.[0] || walletAddress?.[0] || "W"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Core Info */}
          <div className="border-b border-border p-6">
            <h3 className="mb-4 text-lg font-semibold">Wallet Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  BUZZ Balance
                </div>
                <div className="text-lg font-bold">
                  {walletData.buzzBalance}
                  {buzzPrice && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      ($
                      {(
                        parseFloat(walletData.buzzBalance.replace(/,/g, "")) *
                        buzzPrice
                      ).toFixed(2)}
                      )
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Trades
                </div>
                <div className="text-lg font-bold">
                  {walletData.totalTrades}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">NFT Ranks</div>
                <div className="flex gap-1">
                  {walletData.nftRanks.map((rank, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-full bg-accent px-2 py-1 text-xs font-semibold"
                    >
                      {rank}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Active</div>
                <div className="text-sm">{walletData.lastActive}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                Connected Apps
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {walletData.connectedApps.map((app, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Options */}
          <div className="border-b border-border p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {isOwnWallet ? "Account Options" : "Interactions"}
            </h3>

            {isOwnWallet ? (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-2"
                >
                  <Icon name="image" className="h-4 w-4" />
                  <span>Change displayed rep NFT</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-2"
                >
                  <Icon name="edit" className="h-4 w-4" />
                  <span>Set alias/nickname</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleDisconnect}
                >
                  <Icon name="log-out" className="h-4 w-4" />
                  <span>Disconnect wallet</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-2"
                >
                  <Icon name="user-plus" className="h-4 w-4" />
                  <span>Follow</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-2"
                >
                  <Icon name="send" className="h-4 w-4" />
                  <span>Tip BUZZ</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-start gap-2"
                >
                  <Icon name="image" className="h-4 w-4" />
                  <span>View Rep NFTs</span>
                </Button>
              </div>
            )}

            <div className="mt-4">
              <Link
                href={`https://basescan.org/address/${walletAddress}`}
                target="_blank"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <span>View on BaseScan</span>
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Social Layer */}
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-accent/30 p-3">
                <p className="text-sm">Replied to you on BaseBuzz</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  2 hours ago
                </p>
              </div>
              <div className="rounded-lg bg-accent/30 p-3">
                <p className="text-sm">Followed by BasedProtocol</p>
                <p className="mt-1 text-xs text-muted-foreground">1 day ago</p>
              </div>
              <div className="rounded-lg bg-accent/30 p-3">
                <p className="text-sm">Holder of top Rugtron coin</p>
                <p className="mt-1 text-xs text-muted-foreground">4 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </Sheet>
  );
}
