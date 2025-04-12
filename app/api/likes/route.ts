import { NextRequest, NextResponse } from "next/server";
import {
  likePost,
  unlikePost,
  hasLikedPost,
} from "@/services/engagement.service";

// --- Import NextAuth session --- //
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// GET: Check if a user has liked a post
export async function GET(request: NextRequest) {
  try {
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address; // User address is the ID
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    // Use authenticated user ID
    const hasLiked = await hasLikedPost(userId, post_id);
    return NextResponse.json({ hasLiked });
  } catch (error) {
    console.error("Error in likes API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// POST: Like a post
export async function POST(request: NextRequest) {
  try {
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { post_id } = await request.json();

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    // Use authenticated user ID
    const like = await likePost(userId, post_id);

    if (!like) {
      return NextResponse.json(
        { error: "Failed to like post" },
        { status: 500 }
      );
    }

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error("Error in likes API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// DELETE: Unlike a post
export async function DELETE(request: NextRequest) {
  try {
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    // Use authenticated user ID
    const success = await unlikePost(userId, post_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to unlike post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in likes API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
