import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWalletButton() {
  const { user, isLoading: authLoading, connectWallet, signOut } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Automatically connect wallet to auth when address changes
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (isConnected && address && !user && !isAuthenticating) {
        try {
          setIsAuthenticating(true);
          setError(null);
          await connectWallet(address);
        } catch (err) {
          console.error("Auto wallet connection error:", err);
          let errorMessage = "Failed to connect wallet";
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    autoConnectWallet();
  }, [address, isConnected, user, connectWallet, isAuthenticating]);

  const handleConnect = async () => {
    try {
      setError(null);
      setIsAuthenticating(true);

      // Use RainbowKit's ConnectButton behavior for connecting wallet
      if (!isConnected) {
        await connectAsync();
      } else if (address) {
        // If wallet is already connected, authenticate with our API
        await connectWallet(address);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      let errorMessage = "Failed to connect wallet";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut();
      disconnect();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  // Use RainbowKit's ConnectButton for better UX
  return (
    <div className="relative">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          if (!ready) {
            return (
              <button
                className="inline-flex items-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 shadow-sm"
                disabled
              >
                Loading...
              </button>
            );
          }

          if (connected) {
            return (
              <div className="flex items-center space-x-2">
                <button
                  onClick={openAccountModal}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                >
                  {account.displayName}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Disconnect
                </button>
              </div>
            );
          }

          return (
            <div>
              <button
                onClick={openConnectModal}
                disabled={isPending || isAuthenticating}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending || isAuthenticating
                  ? "Connecting..."
                  : "Connect Wallet"}
              </button>

              {error && (
                <div className="mt-2 text-sm text-red-600">{error}</div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
