/**
 * Wallet connection hook for BaseBuzz application
 *
 * This hook provides:
 * - Wallet connection state and utilities
 * - Integration with both web3 wallets and our custom session
 * - Persistence of wallet connection state
 */

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAccount } from "wagmi";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: Error | null;
}

export function useWalletConnect() {
  // Get wagmi account state
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  // Our custom state that combines wagmi with our own persistence
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });

  // Initialize state from localStorage and wagmi
  useEffect(() => {
    try {
      // Check localStorage for persisted state
      const savedState = localStorage.getItem("basebuzz_wallet_connected");
      if (savedState) {
        const parsed = JSON.parse(savedState);

        // If wagmi shows connected and we have saved state, use that address
        if (wagmiConnected && parsed.connected) {
          setState({
            isConnected: true,
            address: wagmiAddress || parsed.address,
            isConnecting: false,
            error: null,
          });
          console.log(
            "✅ Restored wallet connection:",
            wagmiAddress || parsed.address,
          );
        }
        // If wagmi is not connected but we have saved state, try to recover
        else if (parsed.connected && parsed.address) {
          setState({
            isConnected: true,
            address: parsed.address,
            isConnecting: false,
            error: null,
          });
          console.log("ℹ️ Using saved wallet address:", parsed.address);
        }
        // Otherwise clear persisted state
        else if (!wagmiConnected) {
          localStorage.removeItem("basebuzz_wallet_connected");
          setState({
            isConnected: false,
            address: null,
            isConnecting: false,
            error: null,
          });
        }
      }
      // If wagmi is connected but we have no saved state, update our state
      else if (wagmiConnected && wagmiAddress) {
        setState({
          isConnected: true,
          address: wagmiAddress,
          isConnecting: false,
          error: null,
        });

        // Save to localStorage
        localStorage.setItem(
          "basebuzz_wallet_connected",
          JSON.stringify({
            connected: true,
            address: wagmiAddress,
          }),
        );

        console.log("✅ Wallet connected from wagmi:", wagmiAddress);
      }
    } catch (error) {
      console.error("❌ Error initializing wallet state:", error);
    }
  }, [wagmiConnected, wagmiAddress]);

  // Connect wallet manually with address
  const connect = useCallback(async (address: string) => {
    if (!address) return;

    try {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      console.log("🔌 Connecting wallet:", address);

      // Call our custom connect endpoint
      const response = await apiFetch("/api/auth/wallet/connect", {
        method: "POST",
        body: JSON.stringify({ address }),
      });

      console.log("✅ Wallet connected:", response);

      // Update local state
      setState({
        isConnected: true,
        address,
        isConnecting: false,
        error: null,
      });

      // Persist to localStorage
      localStorage.setItem(
        "basebuzz_wallet_connected",
        JSON.stringify({
          connected: true,
          address,
        }),
      );

      return response;
    } catch (error) {
      console.error("❌ Error connecting wallet:", error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to connect wallet"),
      }));
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      console.log("🔌 Disconnecting wallet");

      // Clear custom wallet cookie
      document.cookie =
        "basebuzz_wallet_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Clear localStorage
      localStorage.removeItem("basebuzz_wallet_connected");

      // Update state
      setState({
        isConnected: false,
        address: null,
        isConnecting: false,
        error: null,
      });

      console.log("✅ Wallet disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting wallet:", error);
    }
  }, []);

  return {
    connect,
    disconnect,
    isConnected: state.isConnected,
    address: state.address,
    isConnecting: state.isConnecting,
    error: state.error,
  };
}
