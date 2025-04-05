import { NextRequest, NextResponse } from "next/server";
import { getPostsByHashtag } from "@/services/hashtags.service";

// GET: Retrieve posts with a specific hashtag
export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } },
) {
  try {
    const tag = params.tag;

    if (!tag) {
      return NextResponse.json(
        { error: "Missing hashtag parameter" },
        { status: 400 },
      );
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const posts = await getPostsByHashtag(tag, parsedLimit, parsedPage);

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error retrieving posts by hashtag:", error);
    return NextResponse.json(
      { error: "Failed to retrieve posts" },
      { status: 500 },
    );
  }
}
