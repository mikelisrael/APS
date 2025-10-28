import { useGetResource, useModifyResource } from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
  deleteMessage,
  getChatMessages,
  getOrCreateChat,
  getTotalUnreadCount,
  getUserChats,
  markMessagesAsRead,
  sendMessage,
  uploadAttachment
} from "@/services/chats.service";
import { useEffect } from "react";
import { toast } from "sonner";

// Hook for fetching all user chats
export const useUserChats = () => {
  return useGetResource({
    key: ["chats"],
    fn: () => getUserChats(),
    select: (data) => data || [],
    onError: (error) => {
      toast.error(error.message || "Failed to load chats");
    }
  });
};

// Hook for getting or creating a chat with another user
export const useGetOrCreateChat = (props: any) => {
  return useModifyResource({
    key: ["chats"],
    fn: (userId: string) => getOrCreateChat(userId),
    onError: (error) => {
      toast.error(error.message || "Failed to create chat");
    },
    ...props
  });
};

// Hook for fetching messages in a specific chat
export const useChatMessages = (chatId: string, limit = 50, offset = 0) => {
  return useGetResource({
    key: ["chats", chatId, "messages", `${limit}`, `${offset}`],
    fn: () => getChatMessages(chatId, limit, offset),
    select: (data) => data || [],
    enabled: !!chatId,
    onError: (error) => {
      toast.error(error.message || "Failed to load messages");
    }
  });
};

// Hook for sending a message
export const useSendMessage = () => {
  return useModifyResource({
    key: ["chats"],
    fn: ({
      chatId,
      receiverId,
      content,
      messageType
    }: {
      chatId: string;
      receiverId: string;
      content: string;
      messageType?: string;
    }) => sendMessage(chatId, receiverId, content, messageType),
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    }
  });
};

// Hook for marking messages as read
export const useMarkMessagesAsRead = () => {
  return useModifyResource({
    key: ["chats"],
    fn: (chatId: string) => markMessagesAsRead(chatId),
    onError: (error) => {
      console.error("Failed to mark messages as read:", error);
    }
  });
};

// Hook for deleting a message
export const useDeleteMessage = () => {
  return useModifyResource({
    key: ["chats"],
    fn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      toast.success("Message deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete message");
    }
  });
};

// Hook for uploading attachments
export const useUploadAttachment = () => {
  return useModifyResource({
    key: ["chats"],
    fn: ({ messageId, file }: { messageId: string; file: File }) =>
      uploadAttachment(messageId, file),
    onError: (error) => {
      toast.error(error.message || "Failed to upload attachment");
    }
  });
};

// Hook for getting total unread count
export const useTotalUnreadCount = () => {
  return useGetResource({
    key: ["chats", "unread-count"],
    fn: () => getTotalUnreadCount(),
    select: (data) => data || 0,
    onError: (error) => {
      console.error("Failed to load unread count:", error);
    }
  });
};

// Hook for real-time chat updates using Supabase subscriptions
export const useChatSubscription = (
  chatId: string,
  onNewMessage?: (message: any) => void
) => {
  useEffect(() => {
    if (!chatId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          if (onNewMessage) {
            onNewMessage(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, onNewMessage]);
};

// Hook for real-time updates across all user chats
export const useAllChatsSubscription = (onChatUpdate?: () => void) => {
  useEffect(() => {
    const supabase = createClient();

    const getUserId = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      return user?.id;
    };

    getUserId().then((userId) => {
      if (!userId) return;

      const channel = supabase
        .channel("all-chats")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages"
          },
          (payload) => {
            // Only trigger update if current user is receiver
            if (payload.new.receiver_id === userId && onChatUpdate) {
              onChatUpdate();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "chats"
          },
          () => {
            if (onChatUpdate) {
              onChatUpdate();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [onChatUpdate]);
};

// Combined hook for a complete chat interface
export const useChat = (otherUserId: string) => {
  const { data: chats } = useUserChats();
  const { mutate: getOrCreateChat, isPending: isCreatingChat } =
    useGetOrCreateChat();

  const chat = chats?.find((c: any) =>
    c.participants?.some((p: any) => p.user_id === otherUserId)
  );

  const {
    data: messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useChatMessages(chat?.id || "", 50, 0);

  const { mutate: sendMsg, isPending: isSending } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessagesAsRead();

  const initializeChat = () => {
    if (!chat && otherUserId) {
      getOrCreateChat(otherUserId);
    }
  };

  const sendNewMessage = (content: string, messageType = "text") => {
    if (!chat?.id) return;

    const receiver = chat.participants?.find(
      (p: any) => p.user_id === otherUserId
    );
    if (!receiver) return;

    sendMsg({
      chatId: chat.id,
      receiverId: receiver.user_id,
      content,
      messageType
    });
  };

  const markChatAsRead = () => {
    if (chat?.id) {
      markAsRead(chat.id);
    }
  };

  // Subscribe to new messages
  useChatSubscription(chat?.id || "", () => {
    refetchMessages();
  });

  return {
    chat,
    messages: messages || [],
    isLoading: isLoadingMessages || isCreatingChat,
    isSending,
    initializeChat,
    sendMessage: sendNewMessage,
    markAsRead: markChatAsRead,
    refetchMessages,
    unreadCount: chat?.unread_count || 0
  };
};
