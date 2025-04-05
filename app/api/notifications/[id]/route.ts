import { NextRequest, NextResponse } from "next/server";
import { markNotificationAsRead } from "@/services/notifications.service";

// PUT: Mark a notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing notification ID" },
        { status: 400 },
      );
    }

    const success = await markNotificationAsRead(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in notification [id] API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
