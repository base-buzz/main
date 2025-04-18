"use client";

// import { useAuth } from "@/contexts/auth-context"; // Old context removed
import { useSession } from "next-auth/react";
import { User } from "@/types/interfaces"; // Use your specific User type if available
import { toast } from "sonner";

/**
 * Hook to get the current user's detailed profile information based on the NextAuth session.
 * Includes a function to update the user's profile via API and refresh the session.
 */
export function useCurrentUser() {
  const { data: session, status, update } = useSession();

  const isLoading = status === "loading";

  // Log the raw session data received
  console.log("useCurrentUser - Raw session received:", session);

  // Initialize user as null
  let mappedUser: User | null = null;

  // Map session data only if session and session.user exist
  if (session?.user) {
    // Log the specific image URL from the session before mapping
    console.log(
      "useCurrentUser - Session user image BEFORE mapping:",
      session.user.image
    );

    mappedUser = {
      // Core fields usually available in session
      id: (session.user as any).id ?? session.user.address ?? null, // Use id, fallback to address, then null
      address: session.user.address ?? null,
      handle: session.user.handle ?? null,
      display_name: session.user.name ?? null,
      avatar_url: session.user.image ?? null, // Mapping happens here
      email: session.user.email ?? null,
      // Fields potentially added in session callback (provide defaults)
      bio: (session.user as any).bio ?? null,
      location: (session.user as any).location ?? null,
      header_url: (session.user as any).header_url ?? null,
      tier: (session.user as any).tier ?? null,
      // Add mappings for new fields
      website_url: (session.user as any).website_url ?? null,
      birth_date: (session.user as any).birth_date ?? null,
      // Fields typically NOT in session, default to null/empty/zero
      buzz_balance: 0,
      ens_name: null,
      created_at: "",
      updated_at: "",
      // group_id: null, // Add if group_id is part of your User type
      // verification_type: 'none', // Add if part of your User type
    };

    // Log the mapped avatar URL
    console.log(
      "useCurrentUser - Mapped user avatar_url AFTER mapping:",
      mappedUser.avatar_url
    );
  }

  const user = mappedUser; // Assign the mapped user

  const profileError = null; // Placeholder

  // Function to update profile via API and then refresh session
  const updateUserProfile = async (
    updatedFields: Partial<User>
  ): Promise<boolean> => {
    // Use the mappedUser state for the check
    if (status !== "authenticated" || !user?.id) {
      toast.error("Not authenticated. Cannot update profile.");
      return false;
    }

    const updateToast = toast.loading("Updating profile...");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Trigger session update (refetch) using the function from useSession
      await update();
      console.log("NextAuth session updated after profile save.");

      toast.success("Profile updated successfully", { id: updateToast });
      return true;
    } catch (error: any) {
      console.error("Error updating profile in hook:", error);
      toast.error(error.message || "Failed to update profile", {
        id: updateToast,
      });
      return false;
    }
  };

  return {
    user, // Return the correctly typed mapped user
    isLoading,
    profileError,
    updateUserProfile,
  };
}
