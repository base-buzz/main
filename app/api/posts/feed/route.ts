import { NextRequest, NextResponse } from "next/server";
import { getUserFeed } from "@/services/posts.service";

// GET: Get a user's feed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const posts = await getUserFeed(user_id, parsedLimit, parsedPage);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error in feed API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
