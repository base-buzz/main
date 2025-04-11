"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// import { useAuth } from "@/contexts/auth-context"; // Comment out old hook

export function EmailSignup() {
  /* // --- Email Signup Logic Disabled for SIWE Migration --- 
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUpWithEmail } = useAuth(); // Comment out usage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      // Assuming signUpWithEmail handles the actual logic (API call, etc.)
      await signUpWithEmail(email, "password-placeholder"); // Adjust if password isn't used or needed differently
      toast.success("Check your email for a confirmation link!");
      // Optionally redirect or clear form
      setEmail("");
      // router.push("/check-email");
    } catch (error: any) {
      console.error("Email signup error:", error);
      toast.error(error.message || "Failed to sign up with email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col space-y-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        required
        aria-label="Email address"
      />
      <Button
        type="submit"
        className="h-[44px] w-full rounded-[10px] bg-foreground text-[15px] font-bold leading-5 text-background hover:bg-foreground/90"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Continue with Email"}
      </Button>
    </form>
  );
  */

  // Return null or a placeholder message while email signup is disabled
  return (
    <div className="flex w-full flex-col space-y-2">
      <Input
        type="email"
        placeholder="Enter your email"
        disabled={true}
        aria-label="Email address"
      />
      <Button
        type="button"
        className="h-[44px] w-full rounded-[10px] bg-foreground text-[15px] font-bold leading-5 text-background hover:bg-foreground/90 opacity-50 cursor-not-allowed"
        disabled={true}
      >
        Email Signup Disabled
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Email signup is temporarily disabled.
      </p>
    </div>
  );
}
