import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkle } from "lucide-react";

interface UnauthenticatedViewProps {
  onAuthClick?: () => void;
}

export function UnauthenticatedView({ onAuthClick }: UnauthenticatedViewProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Welcome Card - Main card that matches X.com style */}
      <Card className="w-full overflow-hidden rounded-xl border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            {/* Star icon */}
            <div className="flex h-12 w-12 items-center justify-center">
              <Sparkle className="h-10 w-10 text-primary" />
            </div>

            {/* Main heading */}
            <h1 className="text-2xl font-bold">Welcome to BaseBuzz</h1>

            {/* Description text */}
            <p className="text-center text-muted-foreground">
              Connect your wallet to see posts and join the conversation
            </p>

            {/* Explanation text */}
            <p className="text-base font-medium">
              You need to connect your wallet to view posts, like, comment, and
              participate in the BaseBuzz community.
            </p>

            {/* Description about platform */}
            <p className="text-muted-foreground">
              BaseBuzz is a decentralized social platform built on Base.
            </p>

            {/* Connect wallet button */}
            <Button
              onClick={onAuthClick}
              className="mt-4 w-full max-w-xs rounded-full bg-primary px-4 py-2 font-bold"
            >
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Second card (Revolution card) */}
      <Card className="w-full overflow-hidden rounded-xl border border-border bg-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Rocket icon */}
            <div className="flex h-8 w-8 items-center justify-center">
              <Sparkle className="h-6 w-6" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold">Join the Revolution</h2>

            {/* Description */}
            <p className="text-muted-foreground">
              Be part of the next generation of social media on Base.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
