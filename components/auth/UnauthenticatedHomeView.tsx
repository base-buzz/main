"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkle } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function UnauthenticatedHomeView() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to BaseBuzz
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Connect your wallet to get started
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4">
              {/* Star icon */}
              <div className="flex h-12 w-12 items-center justify-center">
                <Sparkle className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Join the Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to interact with the community
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <ConnectButton />
            </div>
          </div>

          <div className="border-t border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              {/* Rocket icon */}
              <div className="flex h-8 w-8 items-center justify-center">
                <Sparkle className="h-6 w-6" />
              </div>
              <p className="text-xs text-muted-foreground">
                Your gateway to Base ecosystem projects & communities
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
