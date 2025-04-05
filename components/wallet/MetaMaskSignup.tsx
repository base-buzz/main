import { useEffect } from "react";
import { toast } from "sonner";
import { useConnect } from "wagmi";
import { SignupButton } from "./SignupButton";

export const MetaMaskSignup = () => {
  const { connect, connectors, error } = useConnect();
  const metaMaskConnector = connectors.find(
    (connector) => connector.id === "metaMask",
  );

  useEffect(() => {
    // Handle MetaMask specific errors
    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("already processing")) {
        toast.error("Please check MetaMask for pending connections");
      } else if (errorMessage.includes("metamask not installed")) {
        toast.error(
          "MetaMask is not installed. Please install MetaMask to continue",
          {
            action: {
              label: "Install MetaMask",
              onClick: () =>
                window.open("https://metamask.io/download/", "_blank"),
            },
          },
        );
      } else if (errorMessage.includes("chain not configured")) {
        toast.error("Please switch to a supported network in MetaMask");
      }
    }
  }, [error]);

  const handleConnect = () => {
    if (!metaMaskConnector) {
      toast.error("MetaMask connector not found");
      return;
    }

    if (typeof window !== "undefined" && !window.ethereum) {
      toast.error(
        "MetaMask is not installed. Please install MetaMask to continue",
        {
          action: {
            label: "Install MetaMask",
            onClick: () =>
              window.open("https://metamask.io/download/", "_blank"),
          },
        },
      );
      return;
    }

    connect({ connector: metaMaskConnector });
  };

  return (
    <SignupButton
      icon="/metamask.svg"
      text="Continue with MetaMask"
      onClick={handleConnect}
    />
  );
};
