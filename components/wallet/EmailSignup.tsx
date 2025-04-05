import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SignupButton } from "./SignupButton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUpWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email format
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Sign up with email using auth context
      await signUpWithEmail(email, password);

      // Show success message
      toast.success("Check your email for confirmation link!");

      // Redirect to home page
      router.push("/auth/confirmation?email=" + encodeURIComponent(email));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-[44px] rounded-[10px] bg-background"
        required
      />

      {email && (
        <>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[44px] rounded-[10px] bg-background"
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="show-password"
              className="text-sm text-muted-foreground"
            >
              Show password
            </label>
          </div>
        </>
      )}

      {email && password && (
        <SignupButton
          icon="/email.svg"
          text={isLoading ? "Signing up..." : "Continue with Email"}
          onClick={() => {}} // Empty function since we're using form submit
          className="disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        />
      )}
    </form>
  );
}
