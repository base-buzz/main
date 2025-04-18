"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, X } from "lucide-react";
import React from "react";

export function AnalyticsMock() {
  // Placeholder data - replace with actual data fetching if needed later
  const impressions = "2.5K";

  return (
    <div className="my-2 rounded-xl bg-blue-50 p-4 text-sm dark:bg-blue-950/60">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-blue-800 dark:text-blue-300">
          Private to you
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full text-muted-foreground hover:bg-accent"
          aria-label="Dismiss analytics"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="font-semibold">
          {impressions} impressions on your posts in the last 7 days
        </span>
      </div>
      <Button
        variant="default"
        className="mt-1 h-8 rounded-full bg-foreground px-4 text-sm font-bold text-background hover:bg-foreground/90"
      >
        Unlock analytics
      </Button>
    </div>
  );
}
