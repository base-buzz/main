"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EarlyAdopterBox() {
  const [timeRemaining, setTimeRemaining] = useState(6 * 24 * 60 * 60); // 6 days in seconds

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 6 * 24 * 60 * 60));
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  const formatCountdown = () => {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    return `${days} Days ${hours} Hrs ${minutes} Min`;
  };

  return (
    <Card className="w-full rounded-lg border border-border bg-background p-4 shadow-md">
      <p className="text-center text-lg font-medium">
        🔥 Early Adopter Reward Sprint ENDS IN:{" "}
        <span className="text-red-500">{formatCountdown()}</span>
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Badge variant="secondary" className="transition hover:scale-105">
          🎖️ Claim Reputation Badge
        </Badge>
        <Badge variant="secondary" className="transition hover:scale-105">
          ⚡ Governance Boost
        </Badge>
        <Badge variant="secondary" className="transition hover:scale-105">
          💰 LP Gas Rebates
        </Badge>
      </div>
    </Card>
  );
}
