import { supabaseServer } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];

// Like a post
export async function likePost(
  userId: string,
  postId: string,
): Promise<Like | null> {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabaseServer
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingLike) return existingLike as Like;

    // Create new like if not already liked
    const { data, error } = await supabaseServer
      .from("likes")
      .insert({
        user_id: userId,
        post_id: postId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error liking post:", error);
    return null;
  }
}

// Unlike a post
export async function unlikePost(
  userId: string,
  postId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unliking post:", error);
    return false;
  }
}

// Check if a user has liked a post
export async function hasLikedPost(
  userId: string,
  postId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
}

// Get users who liked a post
export async function getPostLikes(
  postId: string,
  limit = 20,
  page = 0,
): Promise<any[]> {
  try {
    const { data, error } = await supabaseServer
      .from("likes")
      .select(
        `
        id,
        created_at,
        users:user_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting post likes:", error);
    return [];
  }
}

// Follow a user
export async function followUser(
  followerId: string,
  followingId: string,
): Promise<Follow | null> {
  try {
    // Check if already following
    const { data: existingFollow, error: checkError } = await supabaseServer
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingFollow) return existingFollow as Follow;

    // Create new follow relationship if not already following
    const { data, error } = await supabaseServer
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error following user:", error);
    return null;
  }
}

// Unfollow a user
export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return false;
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
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

// Get users who follow a specific user
export async function getUserFollowers(
  userId: string,
  limit = 20,
  page = 0,
): Promise<any[]> {
  try {
    const { data, error } = await supabaseServer
      .from("follows")
      .select(
        `
        id,
        created_at,
        users:follower_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `,
      )
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user followers:", error);
    return [];
  }
}

// Get users that a specific user is following
export async function getUserFollowing(
  userId: string,
  limit = 20,
  page = 0,
): Promise<any[]> {
  try {
    const { data, error } = await supabaseServer
      .from("follows")
      .select(
        `
        id,
        created_at,
        users:following_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `,
      )
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user following:", error);
    return [];
  }
}
