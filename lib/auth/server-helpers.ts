import { supabaseServer } from "@/lib/supabase/server";
import { User } from "next-auth";

// Define an extended User type including custom fields from the database
interface ExtendedUser extends User {
  handle?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  header_url?: string | null;
  bio?: string | null;
  location?: string | null;
  tier?: string | null; // Assuming tier is a string, adjust if needed
}

// --- Helper Function: Get/Generate User Handle --- //
export async function getUserHandle(address: string): Promise<string | null> {
  if (!supabaseServer) {
    console.error("getUserHandle - Supabase client unavailable");
    return null;
  }
  const lowerCaseAddress = address.toLowerCase();
  console.log("getUserHandle - Attempting to find/generate handle", {
    address: lowerCaseAddress,
  });
  try {
    const { data: user, error: selectError } = await supabaseServer
      .from("users")
      .select("handle")
      .eq("address", lowerCaseAddress)
      .maybeSingle();
    if (selectError && selectError.code !== "PGRST116") {
      console.error("getUserHandle - Supabase select error", {
        address: lowerCaseAddress,
        code: selectError.code,
        message: selectError.message,
      });
      throw selectError;
    }
    if (user?.handle) {
      console.log("getUserHandle - Found existing handle", {
        address: lowerCaseAddress,
        handle: user.handle,
      });
      return user.handle;
    } else {
      const generatedHandle = lowerCaseAddress.slice(-6);
      console.log(
        "getUserHandle - Handle is missing or user not found, using generated handle",
        { address: lowerCaseAddress, generatedHandle }
      );
      if (user) {
        console.log(
          "getUserHandle - Updating existing user with generated handle",
          { address: lowerCaseAddress }
        );
        const { data: updatedUser, error: updateError } = await supabaseServer
          .from("users")
          .update({
            handle: generatedHandle,
            updated_at: new Date().toISOString(),
          })
          .eq("address", lowerCaseAddress)
          .select("handle")
          .single();
        if (updateError) {
          console.error("getUserHandle - Supabase update error", {
            address: lowerCaseAddress,
            error: updateError,
          });
          throw updateError;
        }
        console.log("getUserHandle - Handle updated successfully", {
          address: lowerCaseAddress,
          handle: updatedUser?.handle,
        });
        return updatedUser?.handle ?? null;
      } else {
        console.log(
          "getUserHandle - Inserting new user with generated handle",
          { address: lowerCaseAddress }
        );
        const { data: newUser, error: insertError } = await supabaseServer
          .from("users")
          .insert({ address: lowerCaseAddress, handle: generatedHandle })
          .select("handle")
          .single();
        if (insertError) {
          console.error("getUserHandle - Supabase insert error", {
            address: lowerCaseAddress,
            error: insertError,
          });
          throw insertError;
        }
        console.log("getUserHandle - New user inserted successfully", {
          address: lowerCaseAddress,
          handle: newUser?.handle,
        });
        return newUser?.handle ?? null;
      }
    }
  } catch (error) {
    console.error(
      `Failed to get/generate handle for ${lowerCaseAddress}:`,
      error
    );
    return null;
  }
}

// Helper function to fetch user profile details needed for the session callback
export async function getUserProfileForSession(
  address: string
): Promise<Partial<ExtendedUser> | null> {
  if (!supabaseServer) {
    console.error("getUserProfileForSession - Supabase client unavailable");
    return null;
  }
  const lowerCaseAddress = address.toLowerCase();
  console.log("getUserProfileForSession - Fetching profile", {
    address: lowerCaseAddress,
  });
  try {
    const { data: userProfile, error } = await supabaseServer
      .from("users")
      .select(
        "handle, display_name, avatar_url, header_url, bio, location, tier, email"
      )
      .eq("address", lowerCaseAddress)
      .single();

    if (error) {
      // PGRST116: Row not found - expected if user not in DB yet.
      if (error.code !== "PGRST116") {
        console.error(
          "getUserProfileForSession - Supabase error fetching profile",
          {
            address: lowerCaseAddress,
            code: error.code,
            message: error.message,
          }
        );
      }
      return null; // Return null if not found or on error
    } else if (userProfile) {
      console.log("getUserProfileForSession - Profile fetched successfully", {
        address: lowerCaseAddress,
      });
      return userProfile;
    }
    return null; // Should not happen if no error and profile exists, but added for safety.
  } catch (err) {
    console.error(
      "getUserProfileForSession - Unexpected error fetching profile",
      {
        address: lowerCaseAddress,
        error: err,
      }
    );
    return null;
  }
}

// Helper function to get the Supabase Auth User ID linked to a public profile
export async function getSupabaseUserId(
  address: string
): Promise<string | null> {
  if (!supabaseServer) {
    console.error("getSupabaseUserId - Supabase client unavailable");
    return null;
  }
  const lowerCaseAddress = address.toLowerCase();
  console.log("getSupabaseUserId - Fetching Supabase Auth User ID", {
    address: lowerCaseAddress,
  });
  try {
    // IMPORTANT: Assumes your 'users' table has a column named 'auth_user_id'
    // containing the UUID from the 'auth.users' table. Adjust if needed.
    const { data, error } = await supabaseServer
      .from("users")
      .select("id") // Select the Supabase UUID column (assuming it's 'id')
      .eq("address", lowerCaseAddress)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        // Ignore 'row not found' errors
        console.error(
          "getSupabaseUserId - Supabase error fetching auth user ID",
          {
            address: lowerCaseAddress,
            code: error.code,
            message: error.message,
          }
        );
      }
      return null;
    } else if (data?.id) {
      console.log("getSupabaseUserId - Supabase Auth User ID found", {
        address: lowerCaseAddress,
        userId: data.id,
      });
      return data.id;
    } else {
      console.warn(
        "getSupabaseUserId - User found but no Auth User ID present?",
        {
          address: lowerCaseAddress,
        }
      );
      return null;
    }
  } catch (err) {
    console.error(
      "getSupabaseUserId - Unexpected error fetching auth user ID",
      {
        address: lowerCaseAddress,
        error: err,
      }
    );
    return null;
  }
}

// --- End Helper Functions --- //
