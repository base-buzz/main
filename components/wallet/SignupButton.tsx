import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import Image from "next/image";
import { toast } from "sonner";

export interface SignupButtonProps {
  icon: string;
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SignupButton = ({
  icon,
  text,
  onClick,
  className,
  disabled,
}: SignupButtonProps) => {
  const { openConnectModal } = useConnectModal();
  const { status, error } = useConnect();
  const { isConnected } = useAccount();

  // Handle connection errors
  if (error) {
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes("rejected")) {
      toast.error("Connection rejected. Please try again.");
    } else if (errorMessage.includes("not installed")) {
      toast.error(
        "Wallet not installed. Please install the wallet to continue.",
      );
    } else {
      toast.error("Failed to connect. Please try again.");
    }
  }

  const handleClick = () => {
    onClick?.();
    openConnectModal?.();
  };

  const isConnecting = status === "pending";
  const isDisabled = disabled || isConnecting || isConnected;

  return (
    <button
      className={`flex h-[44px] w-full items-center gap-3 rounded-[10px] border border-[#536471]/25 bg-white px-4 text-[15px] font-medium leading-5 text-[#3c4043] transition-colors hover:bg-[#e6e6e6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0] disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <div className="shrink-0 rounded-[15px] bg-white p-1">
        <Image
          src={icon}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7"
          aria-hidden="true"
        />
      </div>
      <span className="truncate">
        {isConnecting ? "Connecting..." : isConnected ? "Connected" : text}
      </span>
    </button>
  );
};
