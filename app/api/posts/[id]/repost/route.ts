import { NextRequest, NextResponse } from "next/server";
import { createRepost } from "@/services/posts.service";

// POST: Repost a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const postId = params.id;

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 },
      );
    }

    const repost = await createRepost(userId, postId);

    if (!repost) {
      return NextResponse.json(
        { error: "Failed to create repost" },
        { status: 500 },
      );
    }

    return NextResponse.json(repost, { status: 201 });
  } catch (error) {
    console.error("Error creating repost:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
