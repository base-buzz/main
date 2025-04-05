import { NextRequest, NextResponse } from "next/server";
import { getUserStats } from "@/services/users.service";

// GET: Get user stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const stats = await getUserStats(id);

    if (!stats) {
      return NextResponse.json(
        { error: "User stats not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in user stats API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
