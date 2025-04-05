import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/services/posts.service";

// GET: Get post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error in post [id] API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// PUT: Update post by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const updateData = await request.json();

    // Basic validation
    if (!updateData) {
      return NextResponse.json(
        { error: "Missing update data" },
        { status: 400 },
      );
    }

    // Ensure we're not trying to update the ID
    if (updateData.id && updateData.id !== id) {
      return NextResponse.json(
        { error: "Cannot change post ID" },
        { status: 400 },
      );
    }

    const updatedPost = await updatePost(id, updateData);

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error in post [id] API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// DELETE: Delete post by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const success = await deletePost(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in post [id] API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
