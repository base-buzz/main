import { NextResponse } from "next/server";
import { getUserFeed } from "@/services/posts.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: Request) {
  console.log("GET /api/feed - Handler invoked");
  try {
    const session = await getServerSession(authOptions);
    console.log("GET /api/feed - Session fetched:", !!session);

    if (!session?.user?.address) {
      console.warn("GET /api/feed - Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.address; // Assuming address is the user ID
    console.log(`GET /api/feed - Fetching feed for user: ${userId}`);

    const feedPosts = await getUserFeed(userId);
    console.log(
      `GET /api/feed - Found ${feedPosts.length} posts for user ${userId}`
    );

    return NextResponse.json(feedPosts);
  } catch (error) {
    console.error("GET /api/feed - Error fetching feed:", error);
    // Check if the error is an instance of Error to access message property safely
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: `Failed to fetch feed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
