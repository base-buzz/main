import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <Loader2 style={{ width: size, height: size }} className="animate-spin" />
    </div>
  );
}
