import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/notification";

export const getNotifications = async (
  page: number = 0,
  pageSize: number = 20
): Promise<{
  notifications: Notification[];
  hasMore: boolean;
  unreadCount: number;
}> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  // Fetch notifications with actor info
  const { data: notifications, error, count } = await supabase
    .from("notifications")
    .select(
      `
      *,
      actor:users!notifications_actor_id_fkey(id, full_name, avatar_url, username)
      `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return {
    notifications: notifications || [],
    hasMore: count ? from + pageSize < count : false,
    unreadCount: unreadCount || 0
  };
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) throw error;
};

export const markAllAsRead = async (): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) throw error;
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  const supabase = createClient();

  return supabase
    .channel("notifications_channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        // Fetch the full notification with actor data
        const { data } = await supabase
          .from("notifications")
          .select(
            `
            *,
            actor:users!notifications_actor_id_fkey(id, full_name, avatar_url, username)
            `
          )
          .eq("id", payload.new.id)
          .single();

        if (data) callback(data);
      }
    )
    .subscribe();
};
