import { useAuth } from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
  requestNotificationPermission,
  sendNotificationIfBgd
} from "@/services/push-notifications.service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to request notification permission on app load
 */
export const useNotificationPermission = () => {
  useEffect(() => {
    // Request permission when app loads
    requestNotificationPermission();
  }, []);
};

/**
 * Hook to send push notifications for incoming messages
 */
export const useChatNotifications = (chatId: string, receiverName?: string) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!chatId || !user) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`chat-notifications:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          // Only send notification for messages from OTHER users
          if (payload.new.sender_id === user.id) {
            return;
          }

          // Fetch full message with sender info
          const { data: fullMessage } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:users!messages_sender_id_fkey(id, full_name, avatar_url, username)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullMessage) {
            const senderName = fullMessage.sender?.full_name || "Someone";
            const messagePreview = fullMessage.content || "(attachment)";
            const senderAvatar = fullMessage.sender?.avatar_url;

            // Send push notification (await for async circle conversion)
            await sendNotificationIfBgd(
              senderName,
              messagePreview,
              chatId,
              senderAvatar,
              () => {
                // Use router.push for client-side navigation without full reload
                router.push(`/chat/${chatId}`);
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user?.id, router]);
};

/**
 * Hook to send notifications for ALL incoming messages (not just in current chat)
 * Useful for background notification system
 */
export const useGlobalChatNotifications = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();

    const channel = supabase
      .channel("global-chat-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        async (payload) => {
          // Only send notification for messages to CURRENT user
          if (payload.new.receiver_id !== user.id) {
            return;
          }

          // Fetch full message with sender info and chat info
          const { data: fullMessage } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:users!messages_sender_id_fkey(id, full_name, avatar_url, username)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullMessage) {
            const senderName = fullMessage.sender?.full_name || "Someone";
            const messagePreview = fullMessage.content || "(attachment)";
            const senderAvatar = fullMessage.sender?.avatar_url;
            const chatId = fullMessage.chat_id;

            // Send push notification (await for async circle conversion)
            await sendNotificationIfBgd(
              senderName,
              messagePreview,
              chatId,
              senderAvatar,
              () => {
                // Use router.push for client-side navigation without full reload
                router.push(`/chat/${chatId}`);
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, router]);
};
