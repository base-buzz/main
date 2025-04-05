import { NextRequest, NextResponse } from "next/server";
import { getTrendingHashtags } from "@/services/hashtags.service";

// GET: Retrieve trending hashtags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const trendingHashtags = await getTrendingHashtags(parsedLimit);

    return NextResponse.json(trendingHashtags);
  } catch (error) {
    console.error("Error retrieving trending hashtags:", error);
    return NextResponse.json(
      { error: "Failed to retrieve trending hashtags" },
      { status: 500 },
    );
  }
}
