import { NextRequest, NextResponse } from "next/server";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  createNotification,
} from "@/services/notifications.service";

// GET: Get a user's notifications or unread count
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const count_only = searchParams.get("count_only");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // If count_only is true, return just the unread count
    if (count_only === "true") {
      const unreadCount = await getUnreadNotificationCount(user_id);
      return NextResponse.json({ count: unreadCount });
    }

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const notifications = await getUserNotifications(
      user_id,
      parsedLimit,
      parsedPage,
    );
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error in notifications API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// POST: Create a notification
export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();

    // Basic validation
    if (!notificationData) {
      return NextResponse.json(
        { error: "Missing notification data" },
        { status: 400 },
      );
    }

    if (!notificationData.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!notificationData.type) {
      return NextResponse.json(
        { error: "Missing notification type" },
        { status: 400 },
      );
    }

    const newNotification = await createNotification(notificationData);

    if (!newNotification) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 },
      );
    }

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Error in notifications API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// PUT: Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { user_id } = data;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const success = await markAllNotificationsAsRead(user_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark notifications as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in notifications API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
