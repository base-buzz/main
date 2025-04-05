import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/services/users.service";

// GET: Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in user [id] API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// PUT: Update user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const updateData = await request.json();

    // Basic validation
    if (!updateData) {
      return NextResponse.json(
        { error: "Missing update data" },
        { status: 400 },
      );
    }

    // Ensure we're not trying to update the ID
    if (updateData.id && updateData.id !== id) {
      return NextResponse.json(
        { error: "Cannot change user ID" },
        { status: 400 },
      );
    }

    const updatedUser = await updateUser(id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in user [id] API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
