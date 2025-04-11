"use client";

import * as React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
// import { AuthProvider } from "@/contexts/auth-context"; // Remove old provider import
import "@rainbow-me/rainbowkit/styles.css";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react"; // Import NextAuth SessionProvider
// import { useAccount } from "wagmi"; // Remove this if not used elsewhere in THIS file

// Create a React Query client
const queryClient = new QueryClient();

// Restore WalletSheetContext
interface WalletSheetContextType {
  isWalletSheetOpen: boolean;
  openWalletSheet: () => void;
  closeWalletSheet: () => void;
  toggleWalletSheet: () => void;
}

const WalletSheetContext = createContext<WalletSheetContextType | undefined>(
  undefined
);

export function useWalletSheetContext() {
  const context = useContext(WalletSheetContext);
  if (!context) {
    throw new Error(
      "useWalletSheetContext must be used within a WalletSheetProvider"
    );
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // --- Remove the logging code added previously ---
  /*
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  console.log(`[Providers Render] isWagmiConnected: ${isWagmiConnected}, wagmiAddress: ${wagmiAddress}`);
  */
  // --- End Removal ---

  const [isWalletSheetOpen, setIsWalletSheetOpen] = useState(false); // Restore state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openWalletSheet = () => setIsWalletSheetOpen(true); // Restore handlers
  const closeWalletSheet = () => setIsWalletSheetOpen(false);
  const toggleWalletSheet = () => setIsWalletSheetOpen((prev) => !prev);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        {/* Wrap with SessionProvider */}
        <SessionProvider>
          <RainbowKitProvider>
            <WalletSheetContext.Provider // Restore Provider wrapper
              value={{
                isWalletSheetOpen,
                openWalletSheet,
                closeWalletSheet,
                toggleWalletSheet,
              }}
            >
              {/* Remove AuthProvider wrapper */}
              {/* <AuthProvider> */}
              {/* {mounted && ( */}
              <>
                {children}
                <ServiceWorkerRegistration />
              </>
              {/* )} */}
              {/* </AuthProvider> */}
            </WalletSheetContext.Provider>
          </RainbowKitProvider>
        </SessionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
