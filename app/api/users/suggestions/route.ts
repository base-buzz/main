import { NextRequest, NextResponse } from "next/server";
import { getSuggestedUsers } from "@/services/users.service";

export const dynamic = "force-dynamic";

// GET: Retrieve suggested users for the "Who to follow" feature
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit");
    const parsedLimit = limit ? parseInt(limit, 10) : 5;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get suggested users
    const suggestedUsers = await getSuggestedUsers(userId, parsedLimit);

    return NextResponse.json(suggestedUsers);
  } catch (error) {
    console.error("Error retrieving suggested users:", error);
    return NextResponse.json(
      { error: "Failed to retrieve suggested users" },
      { status: 500 }
    );
  }
}
