"use client";

import { EarlyAdopterBox } from "@/components/ui/early-adopter-box";
import { TrendingBox } from "@/components/ui/trending-box";

export function MarketOverview() {
  return (
    <div className="container-wrapper">
      <div className="container grid grid-cols-1 gap-6 pt-4 lg:grid-cols-2">
        {/* 🔥 Left: Trending Box */}
        <div className="w-full">
          <TrendingBox />
        </div>

        {/* 🚀 Right: Early Adopter Box */}
        <div className="w-full">
          <EarlyAdopterBox />
        </div>
      </div>
    </div>
  );
}
