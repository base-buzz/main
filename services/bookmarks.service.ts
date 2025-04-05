import { supabaseServer } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type Bookmark = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
};

// Create a bookmark
export async function createBookmark(
  userId: string,
  postId: string,
): Promise<Bookmark | null> {
  try {
    // Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await supabaseServer
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingBookmark) return existingBookmark as Bookmark;

    // Create new bookmark if not already bookmarked
    const { data, error } = await supabaseServer
      .from("bookmarks")
      .insert({
        user_id: userId,
        post_id: postId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return null;
  }
}

// Delete a bookmark
export async function deleteBookmark(
  userId: string,
  postId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return false;
  }
}

// Check if a user has bookmarked a post
export async function hasBookmarkedPost(
  userId: string,
  postId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}

// Get a user's bookmarks
export async function getUserBookmarks(
  userId: string,
  limit = 20,
  page = 0,
): Promise<any[]> {
  try {
    const { data, error } = await supabaseServer
      .from("bookmarks")
      .select(
        `
        id,
        created_at,
        posts:post_id (
          id,
          content,
          created_at,
          is_repost,
          repost_id,
          reply_to_id,
          users:user_id (
            id,
            display_name,
            avatar_url,
            address,
            tier
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user bookmarks:", error);
    return [];
  }
}
