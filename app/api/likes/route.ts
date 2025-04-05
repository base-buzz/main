import { NextRequest, NextResponse } from "next/server";
import {
  likePost,
  unlikePost,
  hasLikedPost,
} from "@/services/engagement.service";

// GET: Check if a user has liked a post
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const post_id = searchParams.get("post_id");

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    const hasLiked = await hasLikedPost(user_id, post_id);
    return NextResponse.json({ hasLiked });
  } catch (error) {
    console.error("Error in likes API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// POST: Like a post
export async function POST(request: NextRequest) {
  try {
    const { user_id, post_id } = await request.json();

    // Basic validation
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    const like = await likePost(user_id, post_id);

    if (!like) {
      return NextResponse.json(
        { error: "Failed to like post" },
        { status: 500 },
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
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const post_id = searchParams.get("post_id");

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    const success = await unlikePost(user_id, post_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to unlike post" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in likes API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
