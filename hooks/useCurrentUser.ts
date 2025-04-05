import { useAuth } from "@/contexts/auth-context";

/**
 * Hook to get the current user's detailed profile information.
 * This is now a simple wrapper around useAuth().
 */
export function useCurrentUser() {
  const { user, isLoading, profileError, updateUserProfile } = useAuth();

  return {
    user, // Detailed User profile from AuthContext
    isLoading, // Loading state from AuthContext (covers session + profile)
    error: profileError, // Profile fetching error state from AuthContext
    updateUserProfile, // Profile update function from AuthContext
  };
}
