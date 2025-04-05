"use client";

import { Button } from "@/components/ui/button";
import { UniswapSwapWidget } from "@/components/ui/uniswap-swap-widget";
import Image from "next/image";
import { useTheme } from "next-themes";

export function HeroSection() {
  const { theme } = useTheme();
  const baseLogo =
    theme === "dark"
      ? "/icons/Base_Wordmark_White.svg"
      : "/icons/Base_Wordmark_Blue.svg";

  return (
    <section className="border-b border-border">
      <div className="container-wrapper">
        <div className="container grid grid-cols-1 items-center gap-6 py-6 text-center md:grid-cols-2 md:pt-20 md:text-left">
          {/* ✅ Left Column: Main Hero Messaging */}
          <div className="flex flex-col items-center space-y-4 md:items-start">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              🚀 The AI-Powered DeFi Ecosystem
              <span className="ml-2 inline-flex items-baseline gap-1">
                on
                <Image
                  src={baseLogo}
                  alt="Base Logo"
                  width={110}
                  height={22}
                  className="relative top-[2px] ml-2"
                />
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              $BUZZ fuels the future of on-chain speculation, governance, and
              community building.
            </p>
            <p className="mt-2 font-semibold text-primary">
              Stake $BUZZ now to unlock Early Staker Incentive Payouts, LP
              rewards, and exclusive community access.
            </p>
            <p className="mt-2 font-semibold text-primary">
              Next Reward Drop In:{" "}
              <span className="countdown-timer">5 Days 23 Hrs 50 Min</span>
            </p>

            {/* ✅ Call to Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <Button
                variant="default"
                size="lg"
                className="w-full transition hover:scale-105 md:w-[200px]"
              >
                Connect & Explore
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full transition hover:scale-105 md:w-[200px]"
                onClick={() => {
                  // Navigate to the Careers Tab
                  document
                    .getElementById("careers-tab")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Join Us 🚀
              </Button>
            </div>
          </div>

          {/* ✅ Right Column: Uniswap Swap Box */}
          <div className="space-y-4 text-sm text-muted-foreground">
            <UniswapSwapWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
