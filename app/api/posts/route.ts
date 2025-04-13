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
import {
  createPost,
  getTrendingPosts,
  createReply,
} from "@/services/posts.service";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerSession } from "next-auth/next"; // Import NextAuth session helper
import { authOptions } from "@/lib/authOptions"; // CORRECTED Import authOptions
import { User } from "@/types/interfaces"; // Assuming User type is defined

// GET: Get trending posts
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [GET /api/posts] Starting posts fetch...");

    // --- Get NextAuth session ---
    const session = await getServerSession(authOptions);
    console.log("🔐 [GET /api/posts] NextAuth session:", session);

    // Check X-Custom-Auth header
    const hasCustomAuthHeader = request.headers.get("X-Custom-Auth") === "true";
    if (hasCustomAuthHeader) {
      console.log("📋 X-Custom-Auth header detected");
    }

    // Determine User ID
    let userId: string | undefined = undefined;
    if (session?.user?.address) {
      userId = session.user.address;
      console.log(
        "👤 [GET /api/posts] Using user ID from NextAuth session:",
        userId
      );
    } else if (hasCustomAuthHeader) {
      console.log(
        "⚠️ WARNING: X-Custom-Auth header present, but no session found. Cannot determine user ID."
      );
      return NextResponse.json(
        { error: "Cannot determine user ID via header" },
        { status: 401 }
      );
    }

    // Final check for userId
    if (!userId) {
      console.log("🚫 [GET /api/posts] No authenticated user found.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      "🔍 [GET /api/posts] Fetching posts for user (address):",
      userId
    );
    console.log(
      "ℹ️ [GET /api/posts] Attempting query using supabaseServer (SERVICE ROLE)..."
    );

    // --- Use supabaseServer for the query ---
    // Fetch the 20 most recent posts (removed user filter for now)
    const { data: posts, error: postsError } = await supabaseServer
      .from("posts")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        image_url,
        likes_count,
        reposts_count,
        replies_count
        `
      )
      // .in("user_id", [userId]) // Removed user filter for now
      .is("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(20);
    // --- End query using supabaseServer ---

    if (postsError) {
      console.error(
        "❌ [GET /api/posts] Error fetching posts (supabaseServer query):",
        postsError
      );
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postsError.message },
        { status: 500 }
      );
    }

    if (!posts) {
      console.log(
        "⚠️ [GET /api/posts] supabaseServer query returned null/undefined posts array."
      );
      return NextResponse.json([]);
    }

    console.log(
      `✅ [GET /api/posts] supabaseServer query returned ${posts.length} posts.`
    );

    // --- Fetch User Profiles for the posts ---
    // Get unique non-null author IDs, converting Set to Array
    const authorIds = Array.from(
      new Set(posts.map((p) => p.user_id).filter((id): id is string => !!id))
    );
    let usersData: { [userId: string]: Partial<User> } = {};

    if (authorIds.length > 0) {
      console.log(
        `ℹ️ [GET /api/posts] Fetching profiles for ${authorIds.length} authors...`
      );
      const { data: users, error: usersError } = await supabaseServer
        .from("users")
        .select("id, display_name, avatar_url, address")
        .in("id", authorIds);

      if (usersError) {
        console.error(
          "❌ [GET /api/posts] Error fetching user profiles:",
          usersError
        );
        // Continue without profile data, or return error? For now, continue.
      } else if (users) {
        usersData = users.reduce(
          (acc, user) => {
            acc[user.id] = user;
            return acc;
          },
          {} as { [userId: string]: Partial<User> }
        );
        console.log(
          `✅ [GET /api/posts] Fetched ${Object.keys(usersData).length} user profiles.`
        );
      }
    }
    // --- End Fetch User Profiles ---

    // --- Combine Post and User Data ---
    const enhancedPosts = posts.map((post) => {
      const author = post.user_id ? usersData[post.user_id] : null;
      // Provide null coalescing for generateHandle arguments
      const displayNameForHandle = author?.display_name ?? null;
      const addressForHandle = author?.address ?? null;

      // Map the raw DB post data to the Post interface expected by frontend
      return {
        id: post.id,
        userId: author?.id || post.user_id,
        userName: author?.display_name || "Anonymous",
        userAvatar:
          author?.avatar_url ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${post.user_id || "anon"}`,
        userHandle: generateHandle(displayNameForHandle, addressForHandle),
        content: post.content,
        createdAt: post.created_at,
        image_url: post.image_url, // Include image_url in the mapped object
        likes: post.likes_count || 0,
        retweets: post.reposts_count || 0,
        comments: [], // Assuming comments are fetched separately or not needed in main feed
        verified: false, // Add logic for verification if needed
        // media: post.media_urls || [], // If you still use media array
      };
    });
    // --- End Combine Data ---

    console.log(
      `✅ [GET /api/posts] Returning ${enhancedPosts.length} enhanced posts.`
    );
    return NextResponse.json(enhancedPosts);
  } catch (error) {
    console.error("❌ Unexpected error in posts API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  console.log("🚀 [POST /api/posts] Received request to create post...");

  try {
    // --- Get NextAuth session ---
    const session = await getServerSession(authOptions);
    console.log("🔐 [POST /api/posts] NextAuth session:", session); // Log the session object

    let userIdFromSession = session?.user?.address; // Use NextAuth session user address

    // Final check for user ID before proceeding
    if (!userIdFromSession) {
      console.log(
        "🚫 [POST /api/posts] Unauthorized: No authenticated user found."
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(
      "👤 [POST /api/posts] Authenticated user ID:",
      userIdFromSession
    );

    // Parse request body
    const body = await request.json();
    // Destructure all expected fields, including imageUrl
    const { content, image_url, reply_to_id, quote_tweet_id } = body;

    // Validate content
    if (!content && !image_url) {
      // Allow posts with only an image
      console.log(
        "❌ [POST /api/posts] Validation Error: Request body missing content and image_url."
      );
      return NextResponse.json(
        { error: "Content or image_url is required" },
        { status: 400 }
      );
    }
    console.log(
      `📝 [POST /api/posts] Preparing to create post for user address ${userIdFromSession}:`,
      {
        content,
        image_url,
        reply_to_id,
        quote_tweet_id,
      }
    );

    // --- Add step to fetch User UUID from Address ---
    console.log(
      `ℹ️ [POST /api/posts] Fetching user UUID for address: ${userIdFromSession}`
    );
    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("address", userIdFromSession.toLowerCase()) // Ensure case-insensitivity
      .single();

    if (userError || !userData) {
      console.error(
        `❌ [POST /api/posts] Error fetching user UUID for address ${userIdFromSession}:`,
        userError
      );
      return NextResponse.json(
        {
          error: "Failed to find user profile for the authenticated address.",
          details: userError?.message,
        },
        { status: 500 }
      );
    }

    // This is the user's UUID, not the address
    const userUuid = userData.id;
    console.log(`✅ [POST /api/posts] Found user UUID: ${userUuid}`);

    let newPost;
    // Check if it's a reply or a new post
    if (reply_to_id) {
      console.log(
        `💬 [POST /api/posts] Creating reply to post ${reply_to_id}...`
      );
      // Call createReply service function
      // Pass image_url as well
      newPost = await createReply(userUuid, content, reply_to_id, image_url);
      console.log(`✅ [POST /api/posts] Reply created successfully:`, newPost);
    } else {
      console.log(`📝 [POST /api/posts] Creating new post...`);
      // Call createPost service function (pass userUuid)
      // Construct the PostInsert object
      newPost = await createPost({
        user_id: userUuid,
        content: content,
        image_url: image_url, // Pass image_url
        reply_to_id: null, // reply_to_id is null for new posts
      });
      console.log(
        `✅ [POST /api/posts] New post created successfully:`,
        newPost
      );
    }

    // Return the created post data
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("❌ [POST /api/posts] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- Re-add generateHandle function ---
const generateHandle = (
  displayName: string | null,
  address: string | null
): string => {
  if (displayName) {
    let handle = displayName.toLowerCase().replace(/[^\w]/g, "").trim();
    if (!handle) {
      return address ? address.toLowerCase().substring(0, 10) : "user";
    }
    return handle;
  }
  if (!address) return "user";
  return (
    address.toLowerCase().substring(0, 6) +
    "..." +
    address.toLowerCase().substring(address.length - 4)
  );
};
