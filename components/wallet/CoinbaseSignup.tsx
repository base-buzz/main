import { useEffect } from "react";
import { toast } from "sonner";
import { useConnect } from "wagmi";
import { SignupButton } from "./SignupButton";

export const CoinbaseSignup = () => {
  const { connect, connectors, error } = useConnect();
  const coinbaseConnector = connectors.find(
    (connector) => connector.id === "coinbaseWallet",
  );

  useEffect(() => {
    // Handle Coinbase Wallet specific errors
    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("qr code modal closed")) {
        toast.error("QR code scan cancelled. Please try again.");
      } else if (errorMessage.includes("coinbase wallet not installed")) {
        toast.error(
          "Coinbase Wallet is not installed. Please install to continue",
          {
            action: {
              label: "Install Coinbase Wallet",
              onClick: () =>
                window.open(
                  "https://www.coinbase.com/wallet/downloads",
                  "_blank",
                ),
            },
          },
        );
      } else if (errorMessage.includes("chain not configured")) {
        toast.error("Please switch to a supported network in Coinbase Wallet");
      }
    }
  }, [error]);

  const handleConnect = () => {
    if (!coinbaseConnector) {
      toast.error("Coinbase Wallet connector not found");
      return;
    }

    connect({ connector: coinbaseConnector });
  };

  return (
    <SignupButton
      icon="/coinbase.svg"
      text="Continue with Coinbase"
      onClick={handleConnect}
    />
  );
};
