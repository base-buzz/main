"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

const getRandomValue = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const trendingCategories = [
  "🔥 Trending",
  "🐳 Whale Buys",
  "🚀 Latest",
  "📈 High Volume",
];

export function TrendingBox() {
  const [activeTab, setActiveTab] = useState(trendingCategories[0]);
  const [marketVolume, setMarketVolume] = useState(900000); // Start under 1M
  const [whaleBuy, setWhaleBuy] = useState(800); // Whale buys <1200
  const [trendingTokens, setTrendingTokens] = useState(["$MELONI4ELON"]);
  const [latestTokens, setLatestTokens] = useState(["$TOKEN1"]);
  const [shake, setShake] = useState(false);

  // ✅ Update market volume dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketVolume((prev) => prev + getRandomValue(-2000, 4000));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Update whale buy every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setWhaleBuy(getRandomValue(400, 1200));
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Update trending/latest tokens every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = `$TOKEN${getRandomValue(1, 99)}`;
      setTrendingTokens((prev) => [newToken, ...prev.slice(0, 3)]);
      setLatestTokens((prev) => [newToken, ...prev.slice(0, 3)]);

      // ✅ Trigger shake effect
      setShake(true);
      setTimeout(() => setShake(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-lg border border-border bg-background p-4 shadow-md lg:w-[55%]">
      <div className="flex gap-3 overflow-x-auto border-b border-border pb-2">
        {trendingCategories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {activeTab === "🔥 Trending" &&
          trendingTokens.map((token, index) => (
            <div
              key={index}
              className={clsx(
                "flex items-center justify-between rounded-lg bg-muted p-3 transition",
                { "animate-shake-flash": shake },
              )}
            >
              <span className="text-sm font-medium">{token}</span>
              <span className="text-xs text-muted-foreground">
                +{(Math.random() * 100).toFixed(2)}%
              </span>
            </div>
          ))}

        {activeTab === "🐳 Whale Buys" && (
          <div className="rounded-lg bg-muted p-3 font-medium text-primary">
            🐋 Whale Buy: +${whaleBuy.toLocaleString()} BUZZ
          </div>
        )}

        {activeTab === "🚀 Latest" &&
          latestTokens.map((token, index) => (
            <div key={index} className="rounded-lg bg-muted p-3 text-primary">
              🆕 New Token: {token}
            </div>
          ))}

        {activeTab === "📈 High Volume" && (
          <div className="rounded-lg bg-muted p-3 font-medium text-primary">
            💸 Market Volume: ${marketVolume.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
