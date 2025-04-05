import { NextRequest, NextResponse } from "next/server";
import {
  createBookmark,
  deleteBookmark,
  getUserBookmarks,
} from "@/services/bookmarks.service";

// GET: Get a user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      );
    }

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const bookmarks = await getUserBookmarks(userId, parsedLimit, parsedPage);

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Error retrieving bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to retrieve bookmarks" },
      { status: 500 },
    );
  }
}

// POST: Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, postId } = body;

    if (!userId || !postId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const result = await createBookmark(userId, postId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create bookmark" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// DELETE: Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const postId = searchParams.get("postId");

    if (!userId || !postId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const result = await deleteBookmark(userId, postId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete bookmark" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
