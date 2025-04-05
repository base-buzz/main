import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useAccount, useDisconnect } from "wagmi";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/interfaces";

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

  // Authentication methods
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  connectWallet: (address: string) => Promise<void>;
  linkWalletToAccount: (address: string) => Promise<void>;
  unlinkWallet: (address: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updatedFields: Partial<User>) => Promise<void>;

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

  // Get wallet state from wagmi
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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
    isLoading,
    // Use isConnected from useAccount() scope
    isAuthenticated: isConnected && !!user,
    profileError,
    walletAddress: address ?? null,
    isWalletConnected: isConnected,
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
