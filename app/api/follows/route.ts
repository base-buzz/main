import { NextRequest, NextResponse } from "next/server";
import {
  followUser,
  unfollowUser,
  checkIfFollowing,
} from "@/services/engagement.service";

// --- Import NextAuth session --- //
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// GET: Check if a user is following another user
export async function GET(request: NextRequest) {
  try {
    // --- Get authenticated user (follower) ---
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.address; // User address is the ID
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const following_id = searchParams.get("following_id");

    if (!following_id) {
      return NextResponse.json(
        { error: "Missing following_id" },
        { status: 400 }
      );
    }

    // Use authenticated user ID as follower_id
    const isFollowing = await checkIfFollowing(followerId, following_id);
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error("Error in follows API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// POST: Follow a user
export async function POST(request: NextRequest) {
  try {
    // --- Get authenticated user (follower) ---
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.address;
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json(
        { error: "Missing following_id" },
        { status: 400 }
      );
    }

    // Prevent following self
    if (followerId === following_id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Use authenticated user ID as follower_id
    const follow = await followUser(followerId, following_id);

    if (!follow) {
      return NextResponse.json(
        { error: "Failed to follow user" },
        { status: 500 }
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
    // --- Get authenticated user (follower) ---
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.address;
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const following_id = searchParams.get("following_id");

    if (!following_id) {
      return NextResponse.json(
        { error: "Missing following_id" },
        { status: 400 }
      );
    }

    // Use authenticated user ID as follower_id
    const success = await unfollowUser(followerId, following_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to unfollow user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in follows API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
