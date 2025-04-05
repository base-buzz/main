"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

const getRandomValue = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function MarketStats() {
  const [transactions, setTransactions] = useState([
    "Buy: 0x123...456 → $250 BUZZ",
    "Sell: 0x456...789 → $180 BUZZ",
  ]);
  const [marketVolume, setMarketVolume] = useState(900000);
  const [whaleBuy, setWhaleBuy] = useState(800);
  const [trendingToken, setTrendingToken] = useState("$MELONI4ELON");
  const [mintedTokens, setMintedTokens] = useState<string[]>([]);
  const [shakeTransactions, setShakeTransactions] = useState(false);

  // ✅ Updates market volume (goes up or down)
  useEffect(() => {
    const volumeInterval = setInterval(() => {
      setMarketVolume((prev) =>
        prev + getRandomValue(-2000, 4000)
      );
    }, 2000);

    return () => clearInterval(volumeInterval);
  }, []);

  // ✅ Updates whale buy value
  useEffect(() => {
    const whaleInterval = setInterval(() => {
      setWhaleBuy(getRandomValue(400, 1200));
    }, 300000);

    return () => clearInterval(whaleInterval);
  }, []);

  // ✅ Updates transaction list & adds new tokens randomly
  useEffect(() => {
    const transactionInterval = setInterval(() => {
      const type = Math.random() > 0.5 ? "Buy" : "Sell";
      const amount = getRandomValue(1, 355);
      const newTx = `${type}: 0x${getRandomValue(100, 999)}...${getRandomValue(
        100,
        999
      )} → $${amount} BUZZ`;

      setTransactions((prev) => [newTx, ...prev.slice(0, 4)]);

      if (type === "Buy" && Math.random() > 0.8) {
        const newToken = `$TOKEN${getRandomValue(1, 99)}`;
        setMintedTokens((prev) => [newToken, ...prev.slice(0, 2)]);
      }

      setShakeTransactions(true);
      setTimeout(() => setShakeTransactions(false), 1000);
    }, 5000);

    return () => clearInterval(transactionInterval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* 📊 Live Market Stats */}
      <div className="rounded-lg border border-border p-4 shadow-md bg-background">
        <p className="text-lg font-medium">📊 Live Market Stats</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="text-xl font-bold text-primary">
            💸 Total Market Volume: ${marketVolume.toLocaleString()}
          </div>
          <div>
            🔥 Trending: <span className="text-primary">{trendingToken} 🚀</span>
          </div>
          {mintedTokens.map((token, index) => (
            <div key={index} className="text-sm text-primary">
              🆕 New Token: {token}
            </div>
          ))}
          <div className="text-xl font-bold text-primary">
            🐋 Whale Buy: +${whaleBuy.toLocaleString()} BUZZ
          </div>
        </div>
      </div>

      {/* ⚡ Recent Transactions */}
      <div
        className={clsx(
          "overflow-hidden rounded-lg border border-border p-4 shadow-md transition bg-background",
          { "animate-shake-flash": shakeTransactions }
        )}
      >
        <p className="text-lg font-medium">⚡ Recent Transactions</p>
        <div className="mt-2 space-y-2">
          {transactions.map((tx, index) => (
            <p key={index}>{tx}</p>
          ))}
        </div>
      </div>

    </div>
  );
}
