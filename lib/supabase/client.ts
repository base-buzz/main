import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// This client is meant to be used on the browser for authentication operations
// It does not include the service role key, so it's limited by RLS policies

// To prevent build errors, we check for the environment variables
// Note that we're using the NEXT_PUBLIC_ prefixed variables for client-side code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase client-side credentials are missing. Auth may not work correctly.",
  );
}

// Create a Supabase client instance for client-side operations
export const supabaseClient = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      persistSession: true, // Enable session persistence across page reloads
      autoRefreshToken: true, // Refresh token before it expires
      storageKey: "basebuzz-auth", // Custom storage key for the session
    },
  },
);

// Helper function to handle Supabase auth errors with user-friendly messages
export const handleAuthError = (error: any) => {
  console.error("Auth error:", error);

  const errorMessage = error?.message || "Authentication failed";
  const errorCode = error?.code;

  // Map known error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "This email is already registered",
    "auth/weak-password": "Please choose a stronger password",
    "auth/invalid-credential": "The provided credentials are invalid",
    // Add more error mappings as needed
  };

  return {
    message: errorMessages[errorCode] || errorMessage,
    code: errorCode,
    details: error?.details,
  };
};
