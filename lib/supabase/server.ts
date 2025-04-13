import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// This file should only be imported in server components or API routes
// It uses the service role key which has admin privileges

// Restore the check
if (!process.env.SUPABASE_URL) {
  throw new Error("Missing env.SUPABASE_URL");
}

// Check for service role key remains
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
}

// Create a Supabase client with the service role key for server-side operations
// The createClient function itself might still fail if the URL is missing when used.
export const supabaseServer = createClient<Database>(
  process.env.SUPABASE_URL, // Remove non-null assertion
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error);
  return {
    error: error.message || "An error occurred",
    details: error.details,
    hint: error.hint,
  };
};
