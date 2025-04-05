import { NextRequest, NextResponse } from "next/server";
import { getUserFollowing } from "@/services/engagement.service";

// GET: Get users that a specific user is following
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

    const following = await getUserFollowing(id, parsedLimit, parsedPage);
    return NextResponse.json(following);
  } catch (error) {
    console.error("Error in user following API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
