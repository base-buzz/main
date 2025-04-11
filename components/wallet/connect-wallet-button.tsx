"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { useAuth } from "@/contexts/auth-context"; // Remove old hook
// import { useAccount } from "wagmi"; // Already imported in DesktopNavigation, assuming shared context

// TODO: Re-evaluate if this component is still needed.
// The logic for ConnectButton / Sign In / Sign Out is now primarily in DesktopNavigation.
// This component might be redundant or need simplification.

export function ConnectWalletButton() {
  // const { user, isLoading: authLoading, connectWallet, signOut } = useAuth(); // Remove old hook usage
  // const { address, isConnected } = useAccount(); // Get connection status from wagmi

  // This component's responsibility is likely reduced.
  // It might just need to render the RainbowKit ConnectButton,
  // as the sign-in/sign-out logic is handled elsewhere (DesktopNavigation).

  // Simplified version: Just render the ConnectButton.
  // The ConnectButton itself handles showing connect/disconnect state.
  return <ConnectButton />;

  // --- Old Logic Removed --- //
}
