import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/services/users.service";
import { searchPosts } from "@/services/posts.service";

// GET: Search for users and posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    if (!query) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 },
      );
    }

    // Default to searching both users and posts if type not specified
    const searchType = type || "all";

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    let results: any = {};

    // Search for users
    if (searchType === "users" || searchType === "all") {
      const users = await searchUsers(query, parsedLimit, parsedPage);
      results.users = users;
    }

    // Search for posts
    if (searchType === "posts" || searchType === "all") {
      const posts = await searchPosts(query, parsedLimit, parsedPage);
      results.posts = posts;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in search API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
