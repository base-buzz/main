import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CoinbaseSignup } from "@/components/wallet/CoinbaseSignup";
import { MetaMaskSignup } from "@/components/wallet/MetaMaskSignup";
import { WalletConnectSignup } from "@/components/wallet/WalletConnectSignup";
import { EmailSignup } from "@/components/wallet/EmailSignup";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Connect your wallet
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred method to connect to BaseBuzz
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 p-4">
          <CoinbaseSignup />
          <MetaMaskSignup />
          <WalletConnectSignup />

          <div
            className="flex items-center justify-center py-2"
            role="separator"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-border"></div>
            <span className="mx-2 text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <div className="pb-2">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Continue with email
            </p>
            <EmailSignup />
          </div>

          <p className="text-center text-xs leading-4 text-muted-foreground">
            By connecting, you agree to the{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
