import { NextRequest, NextResponse } from "next/server";
import { getPostReplies, createReply } from "@/services/posts.service";

// GET: Get replies to a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const replies = await getPostReplies(id, parsedLimit, parsedPage);
    return NextResponse.json(replies);
  } catch (error) {
    console.error("Error in post replies API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// POST: Create a reply to a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const { user_id, content } = await request.json();

    // Basic validation
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const newReply = await createReply(user_id, id, content);

    if (!newReply) {
      return NextResponse.json(
        { error: "Failed to create reply" },
        { status: 500 },
      );
    }

    return NextResponse.json(newReply, { status: 201 });
  } catch (error) {
    console.error("Error in post replies API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
