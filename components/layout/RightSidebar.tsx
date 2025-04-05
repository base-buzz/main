"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import WalletProfileSheet from "@/components/wallet/WalletProfileSheet";
import Image from "next/image";

// Mock data for trending topics
const trendingTopics = [
  { id: 1, category: "Politics", name: "Trending in Base", postCount: "104K" },
  { id: 2, category: "Technology", name: "Ethereum", postCount: "53.2K" },
  { id: 3, category: "Crypto", name: "Base", postCount: "207K" },
  { id: 4, category: "NFTs", name: "BAYC", postCount: "12.4K" },
  { id: 5, category: "Finance", name: "DeFi Summer", postCount: "38.7K" },
];

// Mock data for who to follow with profile images
const whoToFollow = [
  {
    id: 1,
    username: "CoinbaseWallet",
    handle: "@CoinbaseWallet",
    verified: true,
    profileImage: "https://i.pravatar.cc/150?img=30",
  },
  {
    id: 2,
    username: "BasedProtocol",
    handle: "@BasedProtocol",
    verified: true,
    profileImage: "https://i.pravatar.cc/150?img=42",
  },
  {
    id: 3,
    username: "Optimism",
    handle: "@OptimismFND",
    verified: true,
    profileImage: "https://i.pravatar.cc/150?img=57",
  },
];

export default function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { address, isConnected } = useAccount();

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="sticky top-0 h-screen w-80 flex-shrink-0 border-l border-border px-6 py-4">
      <div className="flex h-full flex-col gap-6">
        {/* Wallet Address */}
        {isConnected && address && (
          <WalletProfileSheet>
            <button
              className="mb-2 flex w-full items-center justify-between rounded-full bg-accent/40 px-4 py-3 hover:bg-accent/60"
              title="View Wallet Profile"
            >
              <div className="flex items-center">
                <Icon name="wallet" className="mr-3 h-5 w-5" />
                <span className="font-medium">{formatAddress(address)}</span>
              </div>
              <Icon
                name="more-horizontal"
                className="h-5 w-5 text-muted-foreground"
              />
            </button>
          </WalletProfileSheet>
        )}

        {/* Search bar */}
        <div className="relative mb-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon name="search" className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search"
            className="rounded-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* What's happening section */}
        <div className="rounded-2xl bg-accent/50 p-4">
          <h2 className="mb-4 text-xl font-bold">What&apos;s happening</h2>
          <div className="space-y-6">
            {trendingTopics.map((topic) => (
              <div key={topic.id} className="cursor-pointer hover:bg-accent/80">
                <div className="text-xs text-muted-foreground">
                  {topic.category} · Trending
                </div>
                <div className="font-bold">{topic.name}</div>
                <div className="text-xs text-muted-foreground">
                  {topic.postCount} posts
                </div>
              </div>
            ))}
            <Link
              href="/explore"
              className="block text-primary hover:underline"
            >
              Show more
            </Link>
          </div>
        </div>

        {/* Who to follow section */}
        <div className="rounded-2xl bg-accent/50 p-4">
          <h2 className="mb-4 text-xl font-bold">Who to follow</h2>
          <div className="space-y-4">
            {whoToFollow.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt={profile.username}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-lg font-medium text-muted-foreground">
                          {profile.username[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold">{profile.username}</span>
                      {profile.verified && (
                        <Icon
                          name="shield-check"
                          className="ml-1 h-4 w-4 text-primary"
                        />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.handle}
                    </div>
                  </div>
                </div>
                <button className="rounded-full bg-foreground px-4 py-1 text-sm font-bold text-background hover:bg-foreground/80">
                  Follow
                </button>
              </div>
            ))}
            <Link
              href="/connect"
              className="block text-primary hover:underline"
            >
              Show more
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:underline">
            Cookie Policy
          </Link>
          <Link href="#" className="hover:underline">
            Accessibility
          </Link>
          <Link href="#" className="hover:underline">
            Ads info
          </Link>
          <Link href="#" className="hover:underline">
            More
          </Link>
          <span>© 2025 BaseBuzz</span>
        </div>
      </div>
    </div>
  );
}
