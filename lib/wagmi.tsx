"use client";

import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Determine which projectId to use
const projectId =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
    ? process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID_TESTNET
    : process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID_MAINNET;

// Ensure projectId is set, or throw a clear error
if (!projectId) {
  throw new Error(
    "Missing WalletConnect Project ID. Please set it in .env.local."
  );
}

// Create the Wagmi config using RainbowKit's getDefaultConfig
export const config = getDefaultConfig({
  appName: "BaseBuzz",
  projectId,
  chains: [base, mainnet],
  ssr: true,
}) as ReturnType<typeof getDefaultConfig>;

export function Providers({ children }: { children: React.ReactNode }) {
  // Remove mounted state logic for now
  // const [mounted, setMounted] = React.useState(false);
  // React.useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* {mounted && children} */}
          {children} {/* Render children immediately */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
