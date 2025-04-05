import { NextRequest, NextResponse } from "next/server";
import {
  followUser,
  unfollowUser,
  checkIfFollowing,
} from "@/services/engagement.service";

// GET: Check if a user is following another user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const follower_id = searchParams.get("follower_id");
    const following_id = searchParams.get("following_id");

    if (!follower_id) {
      return NextResponse.json(
        { error: "Missing follower_id" },
        { status: 400 },
      );
    }

    if (!following_id) {
      return NextResponse.json(
        { error: "Missing following_id" },
        { status: 400 },
      );
    }

    const isFollowing = await checkIfFollowing(follower_id, following_id);
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error("Error in follows API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// POST: Follow a user
export async function POST(request: NextRequest) {
  try {
    const { follower_id, following_id } = await request.json();

    // Basic validation
    if (!follower_id) {
      return NextResponse.json(
        { error: "Missing follower_id" },
        { status: 400 },
      );
    }

    if (!following_id) {
      return NextResponse.json(
        { error: "Missing following_id" },
        { status: 400 },
      );
    }

    // Prevent following self
    if (follower_id === following_id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    const follow = await followUser(follower_id, following_id);

    if (!follow) {
      return NextResponse.json(
        { error: "Failed to follow user" },
        { status: 500 },
      );
    }

    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    console.error("Error in follows API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// DELETE: Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const follower_id = searchParams.get("follower_id");
    const following_id = searchParams.get("following_id");

    if (!follower_id) {
      return NextResponse.json(
        { error: "Missing follower_id" },
        { status: 400 },
      );
    }

    if (!following_id) {
      return NextResponse.json(
        { error: "Missing following_id" },
        { status: 400 },
      );
    }

    const success = await unfollowUser(follower_id, following_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to unfollow user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in follows API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
