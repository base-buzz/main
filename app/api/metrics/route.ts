import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// GET: Retrieve platform metrics
export async function GET(request: NextRequest) {
  try {
    // Gather various metrics in parallel
    const [
      usersCountResult,
      postsCountResult,
      likesCountResult,
      followsCountResult,
    ] = await Promise.all([
      // Total users count
      supabaseServer.from("users").select("id", { count: "exact", head: true }),

      // Total posts count
      supabaseServer
        .from("posts")
        .select("id", { count: "exact", head: true })
        .is("is_deleted", false),

      // Total likes count
      supabaseServer.from("likes").select("id", { count: "exact", head: true }),

      // Total follows count
      supabaseServer
        .from("follows")
        .select("id", { count: "exact", head: true }),
    ]);

    // Extract counts and handle errors
    const usersCount = usersCountResult.error ? 0 : usersCountResult.count || 0;
    const postsCount = postsCountResult.error ? 0 : postsCountResult.count || 0;
    const likesCount = likesCountResult.error ? 0 : likesCountResult.count || 0;
    const followsCount = followsCountResult.error
      ? 0
      : followsCountResult.count || 0;

    // Return compiled metrics
    return NextResponse.json({
      userCount: usersCount,
      postCount: postsCount,
      likesCount: likesCount,
      followsCount: followsCount,
      engagementRate: postsCount > 0 ? (likesCount / postsCount).toFixed(2) : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving platform metrics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 },
    );
  }
}
