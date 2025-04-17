"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, status: accountStatus } = useAccount();
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      mounted &&
      accountStatus === "disconnected" &&
      sessionStatus === "unauthenticated"
    ) {
      console.log(
        "[CLIENT /home/layout] Wallet disconnected and unauthenticated, redirecting to /..."
      );
      router.replace("/");
    }
  }, [mounted, accountStatus, sessionStatus, router]);

  if (
    !mounted ||
    accountStatus === "connecting" ||
    accountStatus === "reconnecting"
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
