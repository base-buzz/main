import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// GET: Retrieve metrics for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Gather user metrics in parallel
    const [
      postsCountResult,
      receivedLikesResult,
      givenLikesResult,
      followersResult,
      followingResult,
    ] = await Promise.all([
      // Count user's posts
      supabaseServer
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("is_deleted", false),

      // Count received likes
      supabaseServer.rpc("count_received_likes", { user_id_param: userId }),

      // Count likes given
      supabaseServer
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Count followers
      supabaseServer
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId),

      // Count following
      supabaseServer
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

    // Extract counts and handle errors
    const postsCount = postsCountResult.error ? 0 : postsCountResult.count || 0;
    const receivedLikes = receivedLikesResult.error
      ? 0
      : receivedLikesResult.data || 0;
    const givenLikes = givenLikesResult.error ? 0 : givenLikesResult.count || 0;
    const followersCount = followersResult.error
      ? 0
      : followersResult.count || 0;
    const followingCount = followingResult.error
      ? 0
      : followingResult.count || 0;

    // Calculate engagement rate
    const engagementRate =
      postsCount > 0 ? (Number(receivedLikes) / postsCount).toFixed(2) : 0;

    // Return compiled metrics
    return NextResponse.json({
      postsCount,
      receivedLikes,
      givenLikes,
      followersCount,
      followingCount,
      engagementRate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving user metrics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user metrics" },
      { status: 500 },
    );
  }
}
