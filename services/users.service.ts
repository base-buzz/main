/**
 * Users Service - User Data Operations
 * @file apps/www/services/users.service.ts
 *
 * UPDATES:
 * - Updated getUserByAddress to use get_user_by_wallet RPC function
 * - Improved case-insensitive wallet address lookup
 * - Added address normalization to lowercase
 * - Enhanced error handling
 */

import { supabaseServer } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type UserStats = Database["public"]["Views"]["user_stats"]["Row"];

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

// Get a user by wallet address
export async function getUserByAddress(address: string): Promise<User | null> {
  try {
    // Normalize the wallet address to lowercase
    const normalizedAddress = address.toLowerCase();

    // Use the get_user_by_wallet Supabase function for case-insensitive search
    const { data, error } = await supabaseServer.rpc("get_user_by_wallet", {
      wallet_address: normalizedAddress,
    });

    if (error) throw error;

    // Function returns an array of results, we want the first match
    if (data && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error("Error getting user by address:", error);
    return null;
  }
}

// Get a user's stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabaseServer
      .from("user_stats")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}

// Create a new user
export async function createUser(user: UserInsert): Promise<User | null> {
  try {
    const { data, error } = await supabaseServer
      .from("users")
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

// Update an existing user
export async function updateUser(
  id: string,
  updates: UserUpdate,
): Promise<User | null> {
  try {
    const { data, error } = await supabaseServer
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

// Get users that a user follows
export async function getUserFollowing(
  userId: string,
  limit = 10,
  page = 0,
): Promise<User[]> {
  try {
    const { data, error } = await supabaseServer
      .from("follows")
      .select("following_id, users!following_id(*)")
      .eq("follower_id", userId)
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    // Map the nested users data to return an array of User objects
    return data.map((item: any) => item.users) as User[];
  } catch (error) {
    console.error("Error getting user following:", error);
    return [];
  }
}

// Get users that follow a user
export async function getUserFollowers(
  userId: string,
  limit = 10,
  page = 0,
): Promise<User[]> {
  try {
    const { data, error } = await supabaseServer
      .from("follows")
      .select("follower_id, users!follower_id(*)")
      .eq("following_id", userId)
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    // Map the nested users data to return an array of User objects
    return data.map((item: any) => item.users) as User[];
  } catch (error) {
    console.error("Error getting user followers:", error);
    return [];
  }
}

// Check if a user follows another user
export async function checkIfFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "No rows returned" which is expected if not following
    return !!data;
  } catch (error) {
    console.error("Error checking if following:", error);
    return false;
  }
}

// Get user achievements and badges
export async function getUserAchievements(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseServer
      .from("achievements")
      .select(
        `
        id, 
        awarded_at,
        badge_types (
          id,
          name,
          description,
          icon_url,
          tier
        )
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user achievements:", error);
    return [];
  }
}

// Get suggested users to follow (based on popularity, exclude already followed)
export async function getSuggestedUsers(
  userId: string,
  limit = 5,
): Promise<User[]> {
  try {
    // Get IDs of users the current user already follows
    const { data: followingData, error: followingError } = await supabaseServer
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (followingError) throw followingError;

    // Extract the following IDs
    const followingIds = followingData.map((item) => item.following_id);
    // Always exclude the current user
    followingIds.push(userId);

    // Query user_stats view to get popular users (by follower count) that the user doesn't already follow
    const { data, error } = await supabaseServer
      .from("user_stats")
      .select("*")
      .not("id", "in", `(${followingIds.join(",")})`)
      .order("followers_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting suggested users:", error);
    return [];
  }
}

// Search for users by name or address
export async function searchUsers(
  query: string,
  limit = 20,
  page = 0,
): Promise<User[]> {
  try {
    const { data, error } = await supabaseServer
      .from("users")
      .select("*")
      .or(`display_name.ilike.%${query}%,address.ilike.%${query}%`)
      .order("followers_count", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
