/**
 * Post Service (`services/posts.service.ts`)
 *
 * What it does:
 * - Provides functions to interact with the Supabase database for post-related operations.
 * - Includes functions for fetching posts (trending, user feed, user-specific, single post, replies),
 *   creating posts/replies/reposts, updating posts, and deleting posts.
 *
 * How it does it:
 * - Imports Supabase client instances (`supabaseServer` for server-side, `supabaseClient` for client-side).
 * - Uses these clients to build and execute Supabase queries against the 'posts' table and related views/functions.
 * - Defines data types (Post, PostInsert, etc.) based on the Supabase schema.
 * - Handles potential errors during database operations and logs them.
 * - IMPORTANT: Some functions currently use `supabaseClient` (`getPostById`, `getPostReplies`) because they are called
 *   from client components. Functions intended purely for server-side execution (e.g., API routes, Server Components)
 *   use `supabaseServer`.
 *
 * Dependencies for Post Actions:
 * - `@/lib/supabase/server`: Provides the `supabaseServer` instance (uses service role key).
 * - `@/lib/supabase/client`: Provides the `supabaseClient` instance (uses anon key).
 * - `@/types/supabase`: Contains generated types from the Supabase schema.
 */

import { supabaseServer } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
export type TrendingPost = Database["public"]["Views"]["trending_posts"]["Row"];

// Get trending posts
export async function getTrendingPosts(
  limit = 20,
  page = 0
): Promise<TrendingPost[]> {
  try {
    const { data, error } = await supabaseServer
      .from("trending_posts")
      .select("*")
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting trending posts:", error);
    return [];
  }
}

// Get a user's feed (posts from people they follow)
export async function getUserFeed(
  userAddress: string,
  limit = 20,
  page = 0
): Promise<Post[]> {
  console.log(`[getUserFeed] Called for address: ${userAddress}`);
  try {
    // 1. Find the user's UUID based on their address
    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("address", userAddress.toLowerCase())
      .single();

    if (userError || !userData) {
      console.error(
        `[getUserFeed] Error finding user UUID for address ${userAddress}:`,
        userError
      );
      return [];
    }

    const userUuid = userData.id;
    console.log(
      `[getUserFeed] Found UUID: ${userUuid} for address: ${userAddress}`
    );

    // 2. Get UUIDs of users the current user follows
    const { data: followingData, error: followingError } = await supabaseServer
      .from("follows")
      .select("following_id")
      .eq("follower_id", userUuid);

    if (followingError) {
      console.error(
        `[getUserFeed] Error fetching follows for UUID ${userUuid}:`,
        followingError
      );
      throw followingError;
    }

    // 3. Extract the followed UUIDs
    const followingUuids = followingData.map((item) => item.following_id);
    // Include the user's own UUID
    followingUuids.push(userUuid);
    console.log(
      `[getUserFeed] Querying posts for UUIDs: ${followingUuids.join(", ")}`
    );

    // 4. Query posts from followed users and the user themselves using UUIDs
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        *,
        users:user_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `
      )
      .in("user_id", followingUuids)
      .is("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error(
        `[getUserFeed] Error fetching posts for UUIDs ${followingUuids.join(", ")}:`,
        error
      );
      throw error;
    }

    console.log(
      `[getUserFeed] Found ${data?.length ?? 0} posts for address ${userAddress}`
    );
    return data || [];
  } catch (error) {
    console.error(
      `[getUserFeed] General error for address ${userAddress}:`,
      error
    );
    return [];
  }
}

// Get posts from a specific user
export async function getUserPosts(
  userId: string,
  limit = 20,
  page = 0
): Promise<Post[]> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        *,
        users:user_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `
      )
      .eq("user_id", userId)
      .is("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    console.log(
      "[getUserPosts] Raw data from Supabase:",
      JSON.stringify(data, null, 2)
    );
    return data;
  } catch (error) {
    console.error("Error getting user posts:", error);
    return [];
  }
}

// Get a single post by ID (Should be called server-side)
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        *,
        users:user_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `
      )
      .eq("id", id)
      .is("is_deleted", false)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting post by ID:", error);
    return null;
  }
}

// Get replies to a post (Should be called server-side)
export async function getPostReplies(
  postId: string,
  limit = 20,
  page = 0
): Promise<Post[]> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        *,
        users:user_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `
      )
      .eq("reply_to_id", postId)
      .is("is_deleted", false)
      .order("created_at", { ascending: true })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting post replies:", error);
    return [];
  }
}

// Create a new post
export async function createPost(post: PostInsert): Promise<Post | null> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

// Create a reply to a post
export async function createReply(
  userId: string,
  content: string,
  postId: string,
  imageUrl?: string | null
): Promise<Post | null> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .insert({
        user_id: userId,
        content,
        reply_to_id: postId,
        image_url: imageUrl ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Temporarily remove reply count update to fix linter error
    // TODO: Implement atomic increment using a DB function/trigger
    // await supabaseServer
    //   .from("posts")
    //   .update({ replies_count: supabaseServer.rpc("increment", { count: 1 }) })
    //   .eq("id", postId);

    return data;
  } catch (error) {
    console.error("Error creating reply:", error);
    return null;
  }
}

// Create a repost
export async function createRepost(
  userId: string,
  postId: string
): Promise<Post | null> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .insert({
        user_id: userId,
        is_repost: true,
        repost_id: postId,
        content: "", // Repost has no content
      })
      .select()
      .single();

    if (error) throw error;

    // Temporarily remove repost count update to fix linter error
    // TODO: Implement atomic increment using a DB function/trigger
    // await supabaseServer
    //   .from("posts")
    //   .update({ reposts_count: supabaseServer.rpc("increment", { count: 1 }) })
    //   .eq("id", postId);

    return data;
  } catch (error) {
    console.error("Error creating repost:", error);
    return null;
  }
}

// Update a post
export async function updatePost(
  id: string,
  updates: PostUpdate
): Promise<Post | null> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
}

// Soft delete a post (mark as deleted)
export async function deletePost(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
}

// Search for posts by content
export async function searchPosts(
  query: string,
  limit = 20,
  page = 0
): Promise<Post[]> {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        *,
        users:user_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        )
      `
      )
      .ilike("content", `%${query}%`)
      .is("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}
