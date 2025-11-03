import { useGetResource, useModifyResource } from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
  deleteChat,
  deleteMessage,
  editMessage,
  getChatMessages,
  getOrCreateChat,
  getTotalUnreadCount,
  getUserChats,
  markMessagesAsRead,
  sendMessage,
  uploadAttachment
} from "@/services/chats.service";
import { useQueryClient } from "@tanstack/react-query";
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
export const useGetOrCreateChat = (props?: any) => {
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

// Hook for sending a message with OPTIMISTIC UPDATES
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["chats"],
    fn: ({
      chatId,
      receiverId,
      content,
      messageType,
      repliedToId,
      attachments
    }: {
      chatId: string;
      receiverId: string;
      content: string;
      messageType?: string;
      repliedToId?: string | null;
      attachments?: File[];
    }) =>
      sendMessage(
        chatId,
        receiverId,
        content,
        messageType,
        repliedToId,
        attachments
      ),
    onMutate: async (variables: any) => {
      if (!variables || !variables.chatId) return;

      const { chatId, content, repliedToId, receiverId } = variables;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["chats", chatId, "messages"]
      });

      // Get current user
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData([
        "chats",
        chatId,
        "messages",
        "50",
        "0"
      ]);

      // Get replied_to message if exists
      let repliedToMessage = null;
      if (repliedToId && previousMessages) {
        repliedToMessage = (previousMessages as any[]).find(
          (msg: any) => msg.id === repliedToId
        );
      }

      // Create optimistic message
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        sender_id: user.id,
        receiver_id: variables.receiverId,
        content,
        message_type: variables.messageType || "text",
        created_at: new Date().toISOString(),
        is_read: false,
        is_edited: false,
        edited_at: null,
        replied_to_id: repliedToId || null,
        sender: {
          id: user.id,
          full_name: user.user_metadata?.full_name || "You",
          avatar_url: user.user_metadata?.avatar_url || ""
        },
        attachments: [],
        replied_to: repliedToMessage
          ? {
              id: repliedToMessage.id,
              content: repliedToMessage.content,
              sender: repliedToMessage.sender
            }
          : null,
        _optimistic: true // Mark as optimistic
      };

      // Optimistically update messages
      queryClient.setQueryData(
        ["chats", chatId, "messages", "50", "0"],
        (old: any) => [...(old || []), optimisticMessage]
      );

      return { previousMessages, optimisticMessage };
    },
    onError: (error, variables: any, context: any) => {
      // Rollback on error
      if (context?.previousMessages && variables?.chatId) {
        queryClient.setQueryData(
          ["chats", variables.chatId, "messages", "50", "0"],
          context.previousMessages
        );
      }
      toast.error(error.message || "Failed to send message");
    },
    onSuccess: (data, variables: any, context: any) => {
      // Replace optimistic message with real one
      if (variables?.chatId) {
        queryClient.setQueryData(
          ["chats", variables.chatId, "messages", "50", "0"],
          (old: any) => {
            if (!old) return [data];
            return old.map((msg: any) =>
              msg.id === context?.optimisticMessage?.id ? data : msg
            );
          }
        );

        // Refetch chats list to update last message
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    }
  });
};

// Hook for editing a message with OPTIMISTIC UPDATES
export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["chats"],
    fn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(messageId, content),
    onMutate: async (variables: any) => {
      if (!variables || !variables.messageId) return;

      const { messageId, content } = variables;

      // Find which chat this message belongs to
      const chatsData = queryClient.getQueriesData({
        queryKey: ["chats"]
      });

      let chatId: string | null = null;
      let previousMessages: any = null;

      for (const [key, data] of chatsData) {
        const keyArray = key as string[];
        if (keyArray.includes("messages") && data) {
          const messages = data as any[];
          const message = messages.find((m: any) => m.id === messageId);
          if (message) {
            chatId = keyArray[1];
            previousMessages = data;
            break;
          }
        }
      }

      if (!chatId) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["chats", chatId, "messages"]
      });

      // Optimistically update message
      queryClient.setQueryData(
        ["chats", chatId, "messages", "50", "0"],
        (old: any) => {
          if (!old) return old;
          return old.map((msg: any) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content,
                  is_edited: true,
                  edited_at: new Date().toISOString(),
                  _optimistic: true
                }
              : msg
          );
        }
      );

      return { chatId, previousMessages };
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.chatId && context?.previousMessages) {
        queryClient.setQueryData(
          ["chats", context.chatId, "messages", "50", "0"],
          context.previousMessages
        );
      }
      toast.error(error.message || "Failed to edit message");
    },
    onSuccess: (data, variables, context: any) => {
      // Replace optimistic message with real one
      if (context?.chatId) {
        queryClient.setQueryData(
          ["chats", context.chatId, "messages", "50", "0"],
          (old: any) => {
            if (!old) return old;
            return old.map((msg: any) =>
              msg.id === variables.messageId ? data : msg
            );
          }
        );
      }
      toast.success("Message updated");
    }
  });
};

// Hook for deleting a message with OPTIMISTIC UPDATES
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["chats"],
    fn: (messageId: string) => deleteMessage(messageId),
    onMutate: async (messageId) => {
      // Find which chat this message belongs to
      const chatsData = queryClient.getQueriesData({
        queryKey: ["chats"]
      });

      let chatId: string | null = null;
      let previousMessages: any = null;

      for (const [key, data] of chatsData) {
        const keyArray = key as string[];
        if (keyArray.includes("messages") && data) {
          const messages = data as any[];
          const message = messages.find((m: any) => m.id === messageId);
          if (message) {
            chatId = keyArray[1];
            previousMessages = data;
            break;
          }
        }
      }

      if (!chatId) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["chats", chatId, "messages"]
      });

      // Optimistically remove message
      queryClient.setQueryData(
        ["chats", chatId, "messages", "50", "0"],
        (old: any) => {
          if (!old) return old;
          return old.filter((msg: any) => msg.id !== messageId);
        }
      );

      return { chatId, previousMessages };
    },
    onError: (error, messageId, context: any) => {
      // Rollback on error
      if (context?.chatId && context?.previousMessages) {
        queryClient.setQueryData(
          ["chats", context.chatId, "messages", "50", "0"],
          context.previousMessages
        );
      }
      toast.error(error.message || "Failed to delete message");
    },
    onSuccess: (data, messageId, context: any) => {
      toast.success("Message deleted");
      // Refetch chats list to update last message
      queryClient.invalidateQueries({ queryKey: ["chats"] });
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

// IMPROVED: Real-time chat subscription with instant cache updates
export const useChatSubscription = (
  chatId: string,
  onNewMessage?: (message: any) => void
) => {
  const queryClient = useQueryClient();

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
        async (payload) => {
          console.log("New message received:", payload.new);

          // Fetch full message with relations
          const { data: fullMessage } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
              receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url),
              attachments:chat_attachments(*),
              replied_to:messages!messages_replied_to_id_fkey(
                id,
                content,
                sender:users!messages_sender_id_fkey(id, full_name, avatar_url)
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullMessage) {
            // Instantly update cache
            queryClient.setQueryData(
              ["chats", chatId, "messages", "50", "0"],
              (old: any) => {
                if (!old) return [fullMessage];

                // Remove any optimistic message for this content
                const filtered = old.filter(
                  (msg: any) =>
                    !msg._optimistic || msg.content !== fullMessage.content
                );

                // Check if message already exists
                const exists = filtered.some(
                  (msg: any) => msg.id === fullMessage.id
                );
                if (exists) return old;

                return [...filtered, fullMessage];
              }
            );
          }

          if (onNewMessage) {
            onNewMessage(fullMessage || payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          console.log("Message updated:", payload.new);

          // Fetch full message with relations
          const { data: fullMessage } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
              receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url),
              attachments:chat_attachments(*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullMessage) {
            // Instantly update cache
            queryClient.setQueryData(
              ["chats", chatId, "messages", "50", "0"],
              (old: any) => {
                if (!old) return [fullMessage];
                return old.map((msg: any) =>
                  msg.id === fullMessage.id ? fullMessage : msg
                );
              }
            );
          }

          if (onNewMessage) {
            onNewMessage(fullMessage || payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log("Message deleted (real-time):", payload.old);

          // Instantly update cache - remove the deleted message
          queryClient.setQueryData(
            ["chats", chatId, "messages", "50", "0"],
            (old: any) => {
              if (!old) return old;
              const filtered = old.filter((msg: any) => msg.id !== payload.old.id);
              console.log(`Removed message ${payload.old.id} from cache. Before: ${old.length}, After: ${filtered.length}`);
              return filtered;
            }
          );

          // Also invalidate to ensure consistency
          queryClient.invalidateQueries({ 
            queryKey: ["chats", chatId, "messages"] 
          });

          if (onNewMessage) {
            onNewMessage(payload.old);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for chat ${chatId}:`, status);
      });

    return () => {
      console.log(`Unsubscribing from chat ${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId, onNewMessage, queryClient]);
};

// Hook for real-time updates across all user chats
export const useAllChatsSubscription = (onChatUpdate?: () => void) => {
  const queryClient = useQueryClient();

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
            // Invalidate chats list to update last message
            queryClient.invalidateQueries({ queryKey: ["chats"] });

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
            table: "messages"
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            if (onChatUpdate) {
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
            queryClient.invalidateQueries({ queryKey: ["chats"] });
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
  }, [onChatUpdate, queryClient]);
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

  const sendNewMessage = (
    content: string,
    messageType = "text",
    repliedToId?: string | null,
    attachments?: File[]
  ) => {
    if (!chat?.id) return;

    const receiver = chat.participants?.find(
      (p: any) => p.user_id === otherUserId
    );
    if (!receiver) return;

    sendMsg({
      chatId: chat.id,
      receiverId: receiver.user_id,
      content,
      messageType,
      repliedToId,
      attachments
    });
  };

  const markChatAsRead = () => {
    if (chat?.id) {
      markAsRead(chat.id);
    }
  };

  // Subscribe to new messages
  useChatSubscription(chat?.id || "");

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

export const useDeleteChat = () => {
  return useModifyResource({
    key: ["chats"],
    fn: (chatId: string) => deleteChat(chatId),
    onSuccess: () => {
      toast.success("Chat deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete chat");
    }
  });
};
