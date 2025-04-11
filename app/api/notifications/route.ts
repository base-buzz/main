import { NextRequest, NextResponse } from "next/server";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  createNotification,
} from "@/services/notifications.service";

// --- Import NextAuth session --- //
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Get a user's notifications or unread count
export async function GET(request: NextRequest) {
  try {
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const count_only = searchParams.get("count_only");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // If count_only is true, return just the unread count
    if (count_only === "true") {
      const unreadCount = await getUnreadNotificationCount(userId);
      return NextResponse.json({ count: unreadCount });
    }

    // Parse pagination parameters
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 0;

    const notifications = await getUserNotifications(
      userId,
      parsedLimit,
      parsedPage
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
    // --- Get authenticated user (sender) ---
    // Note: Notifications often need both sender and recipient IDs.
    // We assume the authenticated user is the IMPLICIT sender/actor causing the notification.
    // The notificationData should contain the RECIPIENT user_id.
    const session = await getServerSession(authOptions);
    const actorUserId = session?.user?.address;
    if (!actorUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationData = await request.json();

    // Basic validation
    if (!notificationData) {
      return NextResponse.json(
        { error: "Missing notification data" },
        { status: 400 }
      );
    }

    if (!notificationData.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!notificationData.type) {
      return NextResponse.json(
        { error: "Missing notification type" },
        { status: 400 }
      );
    }

    // Add the actor_id (authenticated user) to the data if the service expects it
    // notificationData.actor_id = actorUserId;

    const newNotification = await createNotification(notificationData);

    if (!newNotification) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
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
    // --- Get authenticated user ---
    const session = await getServerSession(authOptions);
    const userId = session?.user?.address;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await markAllNotificationsAsRead(userId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark notifications as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in notifications API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
