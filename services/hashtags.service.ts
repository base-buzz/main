import { supabaseServer } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type Hashtag = {
  tag: string;
  count: number;
};

// Get trending hashtags
export async function getTrendingHashtags(limit = 10): Promise<Hashtag[]> {
  try {
    // Query hashtags ordered by usage count
    const { data, error } = await supabaseServer.rpc("get_trending_hashtags", {
      limit_count: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting trending hashtags:", error);
    return [];
  }
}

// Get posts with a specific hashtag
export async function getPostsByHashtag(
  tag: string,
  limit = 20,
  page = 0,
): Promise<Database["public"]["Tables"]["posts"]["Row"][]> {
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
      `,
      )
      .ilike("content", `%#${tag}%`)
      .is("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting posts with hashtag #${tag}:`, error);
    return [];
  }
}
