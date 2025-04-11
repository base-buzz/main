import { NextRequest, NextResponse } from "next/server";
import {
  createBookmark,
  deleteBookmark,
  getUserBookmarks,
} from "@/services/bookmarks.service";

// --- Import NextAuth session --- //
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Get a user's bookmarks
export async function GET(request: NextRequest) {
  try {
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address; // User address is the ID
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const bookmarks = await getUserBookmarks(userId, parsedLimit, parsedPage);

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Error retrieving bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to retrieve bookmarks" },
      { status: 500 }
    );
  }
}

// POST: Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId parameter" },
        { status: 400 }
      );
    }

    const result = await createBookmark(userId, postId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create bookmark" },
        { status: 500 }
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
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId parameter" },
        { status: 400 }
      );
    }

    const result = await deleteBookmark(userId, postId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete bookmark" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
