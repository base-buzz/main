import { NextRequest, NextResponse } from "next/server";
import { getUserFollowers } from "@/services/engagement.service";

// GET: Retrieve users who follow a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const followers = await getUserFollowers(userId, parsedLimit, parsedPage);

    return NextResponse.json(followers);
  } catch (error) {
    console.error("Error retrieving followers:", error);
    return NextResponse.json(
      { error: "Failed to retrieve followers" },
      { status: 500 },
    );
  }
}
