import { useEffect } from "react";
import { toast } from "sonner";
import { useConnect } from "wagmi";
import { SignupButton } from "./SignupButton";

export const WalletConnectSignup = () => {
  const { connect, connectors, error } = useConnect();
  const walletConnectConnector = connectors.find(
    (connector) => connector.id === "walletConnect",
  );

  useEffect(() => {
    // Handle WalletConnect specific errors
    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("user rejected")) {
        toast.error("Connection rejected. Please try again.");
      } else if (errorMessage.includes("qr code modal closed")) {
        toast.error("QR code scan cancelled. Please try again.");
      } else if (errorMessage.includes("chain not configured")) {
        toast.error("Please switch to a supported network");
      } else if (errorMessage.includes("session request timeout")) {
        toast.error("Connection request timed out. Please try again.");
      }
    }
  }, [error]);

  const handleConnect = () => {
    if (!walletConnectConnector) {
      toast.error("WalletConnect connector not found");
      return;
    }

    connect({ connector: walletConnectConnector });
  };

  return (
    <SignupButton
      icon="/wallet-connect.svg"
      text="Continue with WalletConnect"
      onClick={handleConnect}
      className="bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#FF0080] bg-[length:200%_auto] text-primary-foreground hover:bg-right"
    />
  );
};
