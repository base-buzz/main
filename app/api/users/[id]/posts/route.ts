import { NextRequest, NextResponse } from "next/server";
import { getUserPosts } from "@/services/posts.service";

// GET: Get a user's posts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const posts = await getUserPosts(id, parsedLimit, parsedPage);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error in user posts API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
