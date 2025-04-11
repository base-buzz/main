"use client"; // Assuming NotLoggedInLayout might use client-side hooks

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi"; // Import useAccount
import NotLoggedInLayout from "@/components/layout/auth/NotLoggedInLayout";

export default function RootPage() {
  const { data: session, status } = useSession();
  const { isConnected } = useAccount(); // Get wallet connection status
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // Prevent hydration mismatch

  useEffect(() => {
    setIsClient(true); // Indicate client-side has mounted

    if (status === "loading") return; // Wait for session status

    if (status === "authenticated" && session?.user?.handle) {
      // If authenticated, redirect to user's handle page
      const targetPath = `/${session.user.handle}`;
      console.log(`[CLIENT /] Authenticated, redirecting to ${targetPath}...`);
      router.replace(targetPath);
    } else if (isConnected && status === "unauthenticated") {
      // If wallet is connected but not signed in, redirect to /home (where sign-in button is)
      console.log(
        "[CLIENT /] Wallet connected, unauthenticated, redirecting to /home..."
      );
      router.replace("/home");
    }
  }, [status, isConnected, session, router]);

  // Render loading state until client hydration and session status are known
  if (!isClient || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading session...
      </div>
    );
  }

  // If user is unauthenticated and wallet is NOT connected, show the NotLoggedInLayout
  if (status === "unauthenticated" && !isConnected) {
    return <NotLoggedInLayout />;
  }

  // Fallback: Render loading state while redirecting or if in an unexpected state
  // This case should ideally not be reached if redirects work correctly
  return (
    <div className="flex h-screen items-center justify-center">Loading...</div>
  );
}
