/**
 * User Stats API
 * @file apps/www/app/api/users/stats/route.ts
 *
 * This API retrieves statistics for a user including:
 * - Post count
 * - Follower count
 * - Following count
 * - Likes received
 * - Profile information
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const userId = searchParams.get("userId");

  if (!address && !userId) {
    return NextResponse.json(
      { error: "Either wallet address or user ID is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Find user by address or id
    let userData;

    if (address) {
      const normalizedAddress = address.toLowerCase();
      console.log(`Looking for user with address: ${normalizedAddress}`);

      // Query using direct RPC function that handles case-insensitive matching
      const { data: userResult, error: userError } = await supabase.rpc(
        "get_user_by_wallet",
        { wallet_address: normalizedAddress },
      );

      if (userError) {
        console.error("Error finding user by wallet:", userError);
        return NextResponse.json(
          { error: "Error finding user" },
          { status: 500 },
        );
      }

      if (!userResult || userResult.length === 0) {
        console.log("No user found with address:", normalizedAddress);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      userData = userResult[0];
    } else if (userId) {
      console.log(`Looking for user with ID: ${userId}`);

      // Find user by ID
      const { data: userResult, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error finding user by ID:", userError);
        return NextResponse.json(
          { error: "Error finding user" },
          { status: 500 },
        );
      }

      if (!userResult) {
        console.log("No user found with ID:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      userData = userResult;
    }

    // Get user's post count
    const { count: postsCount, error: postsError } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.id);

    if (postsError) {
      console.error("Error counting posts:", postsError);
    }

    // Get user's follower count
    const { count: followersCount, error: followersError } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userData.id);

    if (followersError) {
      console.error("Error counting followers:", followersError);
    }

    // Get user's following count
    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", userData.id);

    if (followingError) {
      console.error("Error counting followings:", followingError);
    }

    // Get likes received
    const { count: likesReceived, error: likesError } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.id);

    if (likesError) {
      console.error("Error counting likes received:", likesError);
    }

    // Return the stats
    return NextResponse.json({
      id: userData.id,
      address: userData.address,
      display_name: userData.display_name,
      avatar_url: userData.avatar_url,
      tier: userData.tier,
      buzz_balance: userData.buzz_balance,
      posts_count: postsCount || 0,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      likes_received: likesReceived || 0,
    });
  } catch (error) {
    console.error("Unexpected error in user stats API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
