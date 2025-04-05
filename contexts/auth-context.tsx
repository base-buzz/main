import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/interfaces";
import { SiweMessage } from "siwe";
import { useRouter, usePathname } from "next/navigation";

// Define types for our auth context
interface AuthContextType {
  // Combined auth state and user profile
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  profileError: Error | null;

  // Wallet state
  walletAddress: string | null;
  isWalletConnected: boolean;

  // SIWE state
  isSiweVerified: boolean;
  isVerifyingSiwe: boolean;
  siweError: Error | null;

  // Authentication methods
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  connectWallet: (address: string) => Promise<void>;
  linkWalletToAccount: (address: string) => Promise<void>;
  unlinkWallet: (address: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updatedFields: Partial<User>) => Promise<void>;
  ensureSiweVerified: () => Promise<boolean>;

  // Wallet methods
  getLinkedWallets: () => Promise<string[]>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  // Restore user and profileError state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // SIWE State
  const [isSiweVerified, setIsSiweVerified] = useState<boolean>(false);
  const [isVerifyingSiwe, setIsVerifyingSiwe] = useState<boolean>(false);
  const [siweError, setSiweError] = useState<Error | null>(null);

  // Get wallet state from wagmi
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const pathname = usePathname();

  // Reset SIWE verification state if wallet disconnects
  useEffect(() => {
    // Only reset SIWE state if wallet is not connected
    if (!isConnected) {
      console.log("Wallet disconnected, resetting SIWE state."); // Add log
      setIsSiweVerified(false);
      setSiweError(null);
    }
    // Remove the unconditional reset and address dependency
  }, [isConnected]); // Only depend on isConnected

  // Restore profile fetching function
  const fetchAndSetUserProfile = useCallback(
    async (userId: string | undefined) => {
      if (!userId) {
        setUser(null);
        setProfileError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setProfileError(null);
      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user profile");
        }
        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUser(null);
        setProfileError(
          err instanceof Error ? err : new Error("Unknown profile fetch error")
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initialize auth state and listen for changes
  useEffect(() => {
    setIsLoading(true);
    supabaseClient.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        fetchAndSetUserProfile(initialSession?.user?.id); // Restore profile fetch
        // setIsLoading(false); // Loading handled within fetch function
      })
      .catch((error) => {
        console.error("Error getting initial session:", error);
        setUser(null); // Restore user state update
        setSession(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      fetchAndSetUserProfile(currentSession?.user?.id); // Restore profile fetch
      // setIsLoading(!currentSession); // Loading handled within fetch function
    });

    return () => {
      subscription?.unsubscribe();
    };
    // Restore fetchAndSetUserProfile to dependencies
  }, [fetchAndSetUserProfile]);

  // --- SIWE Logic ---
  const ensureSiweVerified = useCallback(async (): Promise<boolean> => {
    // Define redirect logic once
    const performRedirectIfNeeded = () => {
      if (pathname === "/") {
        console.log("Authenticated on root, redirecting to /home...");
        router.push("/home");
      }
    };

    // 0. Check if a valid server-side session already exists
    try {
      const sessionCheckRes = await fetch("/api/auth/user");
      if (sessionCheckRes.ok) {
        console.log(
          "Existing valid SIWE session found via /api/auth/user check."
        );
        const userData = await sessionCheckRes.json();
        setIsSiweVerified(true);
        setUser(userData);
        performRedirectIfNeeded(); // Redirect if needed after finding session
        return true;
      }
      console.log(
        "/api/auth/user check failed or returned non-ok status, proceeding with SIWE."
      );
    } catch (sessionError) {
      console.error(
        "Error checking existing session with /api/auth/user:",
        sessionError
      );
    }

    // 1. Check client state / connection status
    if (isSiweVerified) {
      console.log("SIWE already verified (client state). Skipping flow.");
      return true;
    }
    if (!isConnected || !address || !chainId) {
      toast.error("Wallet not connected or chainId missing for SIWE.");
      return false;
    }

    // Avoid concurrent verification attempts
    if (isVerifyingSiwe) {
      console.log("SIWE verification already in progress. Skipping.");
      return false; // Return false, don't indicate success yet
    }

    setIsVerifyingSiwe(true);
    setSiweError(null);
    console.log("Starting SIWE verification...");

    try {
      // 2. Fetch nonce from backend
      console.log("Fetching SIWE nonce...");
      const nonceRes = await fetch("/api/auth/siwe/nonce");
      if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
      const { nonce } = await nonceRes.json();
      if (!nonce) throw new Error("Invalid nonce received");

      // 3. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to BaseBuzz.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
      const messageToSign = message.prepareMessage();

      // 4. Request signature from user
      console.log("Requesting signature...");
      const signature = await signMessageAsync({ message: messageToSign });

      // 5. Verify signature with backend
      console.log("Verifying signature...");
      const verifyRes = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSign, signature }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || "SIWE verification failed");
      }

      // 6. On success, update state
      console.log("SIWE verification successful!");
      setIsSiweVerified(true);
      fetchAndSetUserProfile(undefined);
      performRedirectIfNeeded(); // Redirect if needed after completing SIWE

      return true;
    } catch (error: any) {
      console.error("SIWE Error:", error);
      setSiweError(error);
      toast.error(error.message || "Sign-in verification failed.");
      setIsSiweVerified(false);
      return false;
    } finally {
      setIsVerifyingSiwe(false);
    }
  }, [
    isSiweVerified,
    isConnected,
    address,
    chainId,
    signMessageAsync,
    fetchAndSetUserProfile,
    router,
    pathname,
  ]);

  // Automatically trigger SIWE verification when wallet connects
  useEffect(() => {
    if (isConnected && address && !isSiweVerified && !isVerifyingSiwe) {
      console.log(
        "Wallet connected, triggering ensureSiweVerified automatically..."
      );
      ensureSiweVerified();
    }
  }, [
    isConnected,
    address,
    isSiweVerified,
    isVerifyingSiwe,
    ensureSiweVerified,
  ]);

  // Sign up with email/password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Sign up failed");
      }
      return data;
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Sign up failed");
      throw error;
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Sign in failed");
      }
      return data;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Sign in failed");
      throw error;
    }
  };

  // Connect wallet (simplified - no signature required)
  const connectWallet = async (address: string) => {
    try {
      const response = await fetch("/api/auth/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect wallet");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
    }
  };

  // Link wallet to account
  const linkWalletToAccount = async (address: string) => {
    try {
      const response = await fetch("/api/auth/link/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to link wallet");
      }
    } catch (error) {
      console.error("Link wallet error:", error);
      throw error;
    }
  };

  // Unlink wallet
  const unlinkWallet = async (address: string) => {
    try {
      const response = await fetch("/api/auth/unlink/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unlink wallet");
      }
    } catch (error) {
      console.error("Unlink wallet error:", error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.error("Client-side sign out error:", error);
      disconnect();
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Logout failed on server");
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Sign out failed");
    }
  };

  // Get linked wallets
  const getLinkedWallets = async () => {
    try {
      const response = await fetch("/api/auth/user/wallets", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get linked wallets");
      }

      const data = await response.json();
      return data.wallets || [];
    } catch (error) {
      console.error("Get linked wallets error:", error);
      throw error;
    }
  };

  // Restore update user profile method (API call still commented)
  const updateUserProfile = useCallback(
    async (updatedFields: Partial<User>) => {
      if (!user) return;

      const optimisticUser = { ...user, ...updatedFields };
      setUser(optimisticUser); // Update local state optimistically

      try {
        // TODO: Uncomment and implement actual API call to update profile
        // const response = await fetch("/api/auth/user/profile", {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(updatedFields),
        // });
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.error || "Failed to update profile");
        // }
        // const updatedUser = await response.json();
        // setUser(updatedUser); // Update with response from server
        console.log("Simulated profile update:", updatedFields);
        // Cache updated profile in local storage if needed
        // localStorage.setItem('userProfile', JSON.stringify(optimisticUser));
        toast.success("Profile updated successfully!");
      } catch (error: any) {
        console.error("Update profile error:", error);
        setUser(user); // Revert optimistic update on error
        toast.error(error.message || "Failed to update profile");
      }
    },
    [user]
  ); // Add user dependency

  // Context value
  const value: AuthContextType = {
    // Restore real user, error, and update function
    user,
    session,
    isLoading: isLoading || isVerifyingSiwe, // Consider SIWE verification as loading
    isAuthenticated: (isConnected && !!user) || isSiweVerified, // Auth if profile exists OR SIWE verified
    profileError,
    walletAddress: address ?? null,
    isWalletConnected: isConnected,
    isSiweVerified,
    isVerifyingSiwe,
    siweError,
    ensureSiweVerified,
    signUpWithEmail,
    signInWithEmail,
    connectWallet,
    linkWalletToAccount,
    unlinkWallet,
    signOut,
    updateUserProfile, // Restore updateUserProfile
    getLinkedWallets,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
