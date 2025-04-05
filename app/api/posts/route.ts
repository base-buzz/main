/**
 * Posts API - Fetch posts with custom auth support
 * @file apps/www/app/api/posts/route.ts
 *
 * UPDATES:
 * - Added support for custom wallet sessions
 * - Added debugging information
 * - Improved error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { createPost, getTrendingPosts } from "@/services/posts.service";
import { supabaseServer } from "@/lib/supabase/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Type for custom wallet session
interface CustomWalletSession {
  user_id: string;
  wallet_address: string;
  created_at: string;
}

// Check for custom wallet session
const getCustomSession = (
  cookieStore: ReturnType<typeof cookies>,
): CustomWalletSession | null => {
  try {
    const customSessionCookie = cookieStore.get("basebuzz_wallet_session");
    if (customSessionCookie) {
      console.log("Found custom wallet session cookie");
      const parsedSession = JSON.parse(customSessionCookie.value);
      if (
        typeof parsedSession === "object" &&
        parsedSession !== null &&
        "user_id" in parsedSession &&
        "wallet_address" in parsedSession
      ) {
        console.log(
          "Valid custom wallet session found:",
          parsedSession.user_id,
        );
        return parsedSession as CustomWalletSession;
      }
    }
    return null;
  } catch (e) {
    console.error("Error parsing custom session cookie:", e);
    return null;
  }
};

// GET: Get trending posts
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const cookieStore = cookies();

    console.log("🔍 Starting posts fetch...");

    // Check for Supabase session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Supabase session error:", sessionError);
    }

    if (session) {
      console.log("✅ Supabase session found for user:", session.user.id);
    } else {
      console.log("❌ No Supabase session found");
    }

    // Get custom wallet session
    const customSession = getCustomSession(cookieStore);

    if (customSession) {
      console.log(
        `✅ Custom wallet session found for user: ${customSession.user_id}, wallet: ${customSession.wallet_address}`,
      );
    } else {
      console.log("❌ No custom wallet session found");
    }

    // Check X-Custom-Auth header for clients that need to bypass cookie issues
    const hasCustomAuthHeader = request.headers.get("X-Custom-Auth") === "true";
    if (hasCustomAuthHeader) {
      console.log("📋 X-Custom-Auth header detected");
    }

    // Check if we have either auth type
    if (!session && !customSession && !hasCustomAuthHeader) {
      console.log("🚫 No active session found for posts");
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // Get user ID from either session
    let userId: string | undefined = undefined;

    if (session?.user?.id) {
      userId = session.user.id;
      console.log("👤 Using user ID from Supabase session:", userId);
    } else if (customSession?.user_id) {
      userId = customSession.user_id;
      console.log("👤 Using user ID from custom wallet session:", userId);
    } else if (hasCustomAuthHeader) {
      // If we have the custom auth header but no session, use a fallback approach
      // This is a temporary measure - in production we'd properly validate
      // For now, let's fetch sample posts for any wallet-connected user
      console.log("⚠️ Using sample posts due to auth header bypass");

      // Get sample posts from following default accounts
      const samplePosts = await getTrendingPosts(10);
      return NextResponse.json(samplePosts);
    }

    if (!userId) {
      console.log("🚫 Invalid session data - no user ID found");
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 },
      );
    }

    console.log("🔍 Fetching posts for user:", userId);

    // Get user's follows or use default follows if none exist
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (followsError) {
      console.error("❌ Error fetching follows:", followsError);
      return NextResponse.json(
        { error: "Error fetching follows" },
        { status: 500 },
      );
    }

    // Get all followed user IDs
    let followedIds = follows.map((f) => f.following_id);

    // If user isn't following anyone, show some default accounts
    if (followedIds.length === 0) {
      console.log("⚠️ User is not following anyone, using default accounts");

      // Find default account IDs (CoinbaseWallet, BasedProtocol, OptimismFND)
      const { data: defaultAccounts } = await supabase
        .from("users")
        .select("id")
        .in("display_name", ["CoinbaseWallet", "BasedProtocol", "OptimismFND"]);

      if (defaultAccounts && defaultAccounts.length > 0) {
        followedIds = defaultAccounts.map((account) => account.id);
        console.log("✅ Found default accounts:", followedIds);
      } else {
        console.log("❌ No default accounts found");
        return NextResponse.json([]);
      }
    }

    // Fetch posts from followed users
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        likes_count,
        reposts_count, 
        replies_count,
        media_urls,
        user_id,
        users (
          id,
          display_name,
          address,
          avatar_url,
          tier
        )
      `,
      )
      .in("user_id", followedIds)
      .order("created_at", { ascending: false })
      .limit(20);

    if (postsError) {
      console.error("❌ Error fetching posts:", postsError);
      return NextResponse.json(
        { error: "Error fetching posts" },
        { status: 500 },
      );
    }

    // Format posts to match the expected client interface
    const formattedPosts = posts.map((post) => {
      // Extract the user object properly
      const user = post.users as any; // Cast to any to handle the nested object

      // Generate handle from display_name or fall back to address
      let userHandle = "";
      if (user?.display_name) {
        // Create Twitter-like handle from display name
        userHandle = user.display_name
          .toLowerCase()
          .replace(/[^\w]/g, "")
          .trim();
      } else if (user?.address) {
        // Fall back to truncated address
        userHandle = `${user.address.substring(0, 8)}`;
      } else {
        userHandle = "user";
      }

      return {
        id: post.id,
        userId: post.user_id,
        userName: user?.display_name || "Unknown User",
        userHandle: userHandle,
        userAvatar: user?.avatar_url || "https://i.pravatar.cc/150?img=1",
        verified: user?.tier === "gold" || user?.tier === "diamond",
        content: post.content,
        createdAt: post.created_at,
        likes: post.likes_count || 0,
        retweets: post.reposts_count || 0,
        comments: [],
        media: post.media_urls || [],
        _repliesMetadata: {
          hasMoreReplies: (post.replies_count || 0) > 10,
          totalReplies: post.replies_count || 0,
          currentPage: 0,
        },
      };
    });

    console.log(`✅ Returning ${formattedPosts.length} posts`);
    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("❌ Unexpected error in posts API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  try {
    const postData = await request.json();

    // Basic validation
    if (!postData) {
      return NextResponse.json({ error: "Missing post data" }, { status: 400 });
    }

    if (!postData.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!postData.content && !postData.is_repost) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const newPost = await createPost(postData);

    if (!newPost) {
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 },
      );
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error in posts API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
