import { supabaseServer } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

// Get a user's notifications
export async function getUserNotifications(
  userId: string,
  limit = 20,
  page = 0,
): Promise<any[]> {
  try {
    const { data, error } = await supabaseServer
      .from("notifications")
      .select(
        `
        *,
        actors:actor_id (
          id,
          display_name,
          avatar_url,
          address,
          tier
        ),
        posts:post_id (
          id,
          content,
          created_at
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return [];
  }
}

// Get a user's unread notification count
export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  try {
    const { count, error } = await supabaseServer
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(
  userId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

// Create a manual notification (for system-generated notifications)
export async function createNotification(
  notification: NotificationInsert,
): Promise<Notification | null> {
  try {
    const { data, error } = await supabaseServer
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

// Create a system notification for multiple users
export async function createSystemNotificationForUsers(
  userIds: string[],
  message: string,
): Promise<boolean> {
  try {
    // Create notifications in batch
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type: "system" as const,
      message,
    }));

    const { error } = await supabaseServer
      .from("notifications")
      .insert(notifications);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating system notifications:", error);
    return false;
  }
}
