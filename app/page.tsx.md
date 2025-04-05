"use client";

import { useAccount } from "wagmi";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import NotLoggedInLayout from "@/components/layout/auth/NotLoggedInLayout";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const redirectAttempted = useRef(false);

  // Combined auth check effect
  useEffect(() => {
    // Only redirect once
    if (redirectAttempted.current) return;

    // Check for wallet connection in localStorage
    const hasStoredConnection =
      typeof window !== "undefined" &&
      (localStorage.getItem("wagmi.connected") === "true" ||
        localStorage.getItem("rk-connected") === "true");

    if (isConnected || hasStoredConnection) {
      redirectAttempted.current = true;
      // Navigate to home page
      router.push("/home");
      return;
    }

    // If no connection found after a delay, stop loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Longer 2000ms delay

    return () => clearTimeout(timer);
  }, [isConnected, router]);

  // Always show loading spinner until we're certain user is not authenticated
  if (isLoading || isConnected) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Only show NotLoggedInLayout when we're certain user is not authenticated
  return <NotLoggedInLayout />;
}
