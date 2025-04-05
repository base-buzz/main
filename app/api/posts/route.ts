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
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session"; // Import session types/options
import { User } from "@/types/interfaces"; // Assuming User type is defined

// Type for custom wallet session
interface CustomWalletSession {
  user_id: string;
  wallet_address: string;
  created_at: string;
}

// GET: Get trending posts
export async function GET(request: NextRequest) {
  try {
    // Keep using createRouteHandlerClient for session check initially if needed
    // const supabase = createRouteHandlerClient({ cookies });
    const cookieStore = cookies();

    console.log("🔍 [GET /api/posts] Starting posts fetch...");

    // --- Add detailed logging around Iron Session ---
    let rawCookieValue: string | undefined | null = null;
    try {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const cookiesManual = cookieHeader.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.split("=").map((c) => c.trim());
            acc[key] = value;
            return acc;
          },
          {} as Record<string, string>
        );
        rawCookieValue = cookiesManual["myapp-siwe-session"];
      }
      console.log(
        "🍪 [GET /api/posts] Raw myapp-siwe-session cookie value from header:",
        rawCookieValue
      );
    } catch (e) {
      console.error("Error manually reading cookie for logging:", e);
    }

    console.log(
      "🔐 [GET /api/posts] Using sessionOptions:",
      JSON.stringify(sessionOptions)
    ); // Log options (mask password if sensitive)
    // ---- End detailed logging ----

    // Check for Supabase session
    const {
      data: { session },
    } = await createRouteHandlerClient({ cookies }).auth.getSession();

    if (session) {
      console.log("✅ Supabase session found for user:", session.user.id);
    } else {
      console.log("❌ No Supabase session found");
    }

    // ---- Get SIWE session using Iron Session ----
    let siweSession: SessionData | null = null;
    try {
      siweSession = await getIronSession<SessionData>(
        cookieStore,
        sessionOptions
      );
      console.log(
        "📄 [GET /api/posts] Result from getIronSession:",
        JSON.stringify(siweSession)
      ); // Log the full result
      console.log(
        "📄 [GET /api/posts] siweSession.siwe part:",
        JSON.stringify(siweSession?.siwe)
      ); // Log the siwe part

      if (siweSession?.siwe?.address) {
        console.log(
          `✅ [GET /api/posts] Iron Session (SIWE) found for user: ${siweSession.siwe.address}`
        );
      } else {
        console.log(
          "❌ [GET /api/posts] No SIWE data found in Iron Session (after logging result)"
        );
      }
    } catch (ironError) {
      console.error(
        "❌ [GET /api/posts] Error fetching/decrypting Iron Session:",
        ironError
      );
    }
    // ---- End Iron Session Check ----

    // Check X-Custom-Auth header
    const hasCustomAuthHeader = request.headers.get("X-Custom-Auth") === "true";
    if (hasCustomAuthHeader) {
      console.log("📋 X-Custom-Auth header detected");
    }

    // Determine User ID
    let userId: string | undefined = undefined;
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("👤 Using user ID from Supabase session:", userId);
    } else if (siweSession?.userId) {
      // Use userId if it was stored in the SIWE session (might need adjustment)
      userId = siweSession.userId;
      console.log(
        "👤 Using user ID from SIWE session data (userId field):",
        userId
      );
    } else if (siweSession?.siwe?.address) {
      // If userId wasn't stored, try getting it from DB using address (less efficient)
      console.log(
        "👤 Attempting to find user ID from SIWE address:",
        siweSession.siwe.address
      );
      const { data: userData, error: userError } =
        await createRouteHandlerClient({ cookies })
          .from("users")
          .select("id")
          .ilike("address", siweSession.siwe.address)
          .single();
      if (userError) {
        console.error("Error fetching user ID by SIWE address:", userError);
      } else if (userData) {
        userId = userData.id;
        console.log("👤 Found user ID from SIWE address:", userId);
      }
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
      console.log(
        "🚫 Invalid session data - no user ID found after all checks"
      );
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }

    console.log("🔍 [GET /api/posts] Fetching posts for user:", userId);
    console.log(
      "ℹ️ [GET /api/posts] Attempting query using supabaseServer (SERVICE ROLE)..."
    );

    // Determine followed IDs (including self)
    let followedIds = [userId]; // Start with self
    // TODO: Add logic here later to fetch actual follows if needed

    // --- Use supabaseServer for the query ---
    const { data: posts, error: postsError } = await supabaseServer
      .from("posts")
      .select(
        `
        id,
        content,
        created_at,
        user_id
        `
      )
      .in("user_id", followedIds)
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

      return {
        ...(post as any),
        userId: author?.id || post.user_id,
        userName: author?.display_name || "Anonymous",
        userAvatar:
          author?.avatar_url ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${post.user_id || "anon"}`,
        userHandle: generateHandle(displayNameForHandle, addressForHandle),
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
  try {
    const cookieStore = cookies();
    const supabaseUserClient = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    // 1. Verify user authentication (using SIWE session)
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );
    if (!session.siwe?.address) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userAddress = session.siwe.address;

    // 2. Find the user ID associated with the address
    const { data: userData, error: userError } = await supabaseUserClient
      .from("users")
      .select("id")
      .ilike("address", userAddress)
      .single();

    if (userError || !userData) {
      console.error(
        "[POST /api/posts] Error finding user for SIWE session:",
        userError
      );
      return NextResponse.json(
        { error: "User not found for session" },
        { status: 401 }
      );
    }
    const userId = userData.id;

    // 3. Parse request body
    const { content, media } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // 4. Insert the new post using the SERVICE ROLE client
    // We use service role for inserts to bypass potential RLS issues on creation
    const { data: newPostData, error: insertError } = await supabaseServer
      .from("posts")
      .insert({ user_id: userId, content: content, media_urls: media || [] })
      .select() // Select the newly inserted row
      .single();

    if (insertError || !newPostData) {
      console.error("❌ [POST /api/posts] Error inserting post:", insertError);
      return NextResponse.json(
        { error: "Failed to create post", details: insertError?.message },
        { status: 500 }
      );
    }

    // 5. Fetch the newly created post WITH the joined user data using SERVICE ROLE client
    // This ensures the returned object has all necessary fields for the optimistic update
    console.log(
      `ℹ️ [POST /api/posts] Fetching newly created post ${newPostData.id} with user data...`
    );
    const { data: fullNewPost, error: fetchError } = await supabaseServer
      .from("posts")
      .select(
        `
        *,
        user:users (
          id,
          display_name,
          avatar_url,
          address
        )
        `
      )
      .eq("id", newPostData.id)
      .single();

    if (fetchError || !fullNewPost) {
      console.error(
        "❌ [POST /api/posts] Error fetching full new post data:",
        fetchError
      );
      // Return the basic inserted data as a fallback if fetching the full post fails
      return NextResponse.json(newPostData, { status: 201 });
    }

    // 6. Map the full post data to the format expected by the frontend
    const author = fullNewPost.user as Partial<User> | null;
    // Provide null coalescing for generateHandle arguments
    const displayNameForHandle = author?.display_name ?? null;
    const addressForHandle = author?.address ?? null;

    const enhancedPost = {
      ...(fullNewPost as any),
      userId: author?.id || fullNewPost.user_id,
      userName: author?.display_name || "Anonymous",
      userAvatar:
        author?.avatar_url ||
        `https://api.dicebear.com/7.x/shapes/svg?seed=${fullNewPost.user_id || "anon"}`,
      userHandle: generateHandle(displayNameForHandle, addressForHandle),
    };

    console.log(
      "✅ [POST /api/posts] Post created successfully, returning enhanced post:",
      enhancedPost.id
    );
    return NextResponse.json(enhancedPost, { status: 201 });
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
