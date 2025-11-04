"use client";

import { ChatDeletedEmptyState } from "@/app/(logged-in)/chat/components/chat-deleted";
import {
  useChatMessages,
  useChatSubscription,
  useDeleteMessage,
  useEditMessage,
  useMarkMessagesAsRead,
  useSendMessage,
  useUserChats
} from "@/hooks/use-chats";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/hooks/use-query-resource";
import { Chat, ChatAttachment, Message } from "@/services/chats.service";
import { Loader2, MessageCircle } from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ChatBubble from "./chat-bubble";
import ChatInput from "./chat-input";
import DateDivider from "./date-divider";

interface Sender {
  name: string;
  avatar: string;
}

interface TransformedMessage {
  id: string;
  message: string;
  time: string;
  timestamp: string;
  sender: Sender;
  isOwn: boolean;
  isEdited: boolean;
  editedAt?: string | null;
  isOptimistic?: boolean;
  attachments?: ChatAttachment[];
  repliedTo?: {
    id: string;
    message: string;
    sender: string;
    isOwn?: boolean;
  } | null;
}

interface ReplyingTo {
  id: string;
  message: string;
  sender: string;
}

interface EditingMessage {
  id: string;
  message: string;
}

interface ReceiverInfo {
  id: string;
  full_name: string;
  avatar_url?: string;
}

const ChatZone: React.FC = () => {
  const { ["chat-id"]: activeChatId } = useParams();
  const chatId = activeChatId as string;

  const [stickyDate, setStickyDate] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(
    null
  );
  const [cachedReceiver, setCachedReceiver] = useState<ReceiverInfo | null>(
    null
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const previousMessageCountRef = useRef(0);

  const router = useRouter();
  const { user } = useAuth();
  const { data: chats, isLoading: isLoadingChats } = useUserChats();
  const { data: messages, isLoading } = useChatMessages(chatId);
  const { mutate: markAsRead } = useMarkMessagesAsRead();
  const { mutate: sendMessageMutation, isPending: isSending } =
    useSendMessage();
  const { mutate: deleteMessageMutation } = useDeleteMessage();
  const { mutate: editMessageMutation, isPending: isEditing } =
    useEditMessage();

  // Get current chat to find receiver
  const currentChat = useMemo(() => {
    return chats?.find((chat: Chat) => chat.id === chatId);
  }, [chats, chatId]);

  const receiver = useMemo(() => {
    if (!currentChat || !user) return null;

    const otherParticipant = currentChat.participants?.find(
      (p: any) => p.user_id !== user.id
    );

    return otherParticipant?.user || null;
  }, [currentChat, user]);

  // Get receiver ID for sending messages
  const receiverId = useMemo(() => {
    if (!currentChat || !user) return null;

    const otherParticipant = currentChat.participants?.find(
      (p: any) => p.user_id !== user.id
    );

    return otherParticipant?.user_id || null;
  }, [currentChat, user]);

  // Cache receiver info when it's available
  useEffect(() => {
    if (receiver) {
      setCachedReceiver({
        id: receiverId!,
        full_name: receiver.full_name,
        avatar_url: receiver.avatar_url
      });
    }
  }, [receiver, receiverId]);

  const chatWasDeleted = useMemo(() => {
    if (!chatId || !chats || isLoadingChats || isLoading) return false;
    return !currentChat;
  }, [chatId, chats, currentChat, isLoadingChats, isLoading]);

  // Use cached receiver if current one is undefined (chat was deleted)
  const displayReceiver = receiver || cachedReceiver;
  const displayReceiverId = receiverId || cachedReceiver?.id;

  usePageTitle(displayReceiver?.full_name || "Chat");

  // Subscribe to real-time updates
  useChatSubscription(chatId);

  // Mark messages as read when chat opens or new messages arrive
  useEffect(() => {
    if (chatId && messages && messages.length > 0) {
      const hasUnread = messages.some(
        (msg: Message) => !msg.is_read && msg.receiver_id === user?.id
      );
      if (hasUnread) {
        markAsRead(chatId);
      }
    }
  }, [chatId, messages, user?.id, markAsRead]);

  const transformedMessages: TransformedMessage[] = useMemo(() => {
    if (!messages || !user) return [];

    return messages.map((msg: any) => ({
      id: msg.id,
      message: msg.content,
      time: moment(msg.created_at).format("HH:mm"),
      timestamp: msg.created_at,
      sender: {
        name: msg.sender?.full_name || "Unknown",
        avatar: msg.sender?.avatar_url || ""
      },
      isOwn: msg.sender_id === user.id,
      isEdited: msg.is_edited || false,
      editedAt: msg.edited_at,
      isOptimistic: msg._optimistic || false,
      attachments: msg.attachments || [],
      repliedTo: msg.replied_to
        ? {
            id: msg.replied_to.id,
            message: msg.replied_to.content,
            sender: msg.replied_to.sender?.full_name || "Unknown",
            isOwn: msg.replied_to.sender?.id === user.id
          }
        : null
    }));
  }, [messages, user]);

  // Scroll to bottom only when NEW messages are added (not when edited)
  useEffect(() => {
    if (scrollContainerRef.current && transformedMessages.length > 0) {
      const currentMessageCount = transformedMessages.length;
      const isNewMessage =
        currentMessageCount > previousMessageCountRef.current;

      if (isNewMessage) {
        const scrollToBottom = () => {
          if (scrollContainerRef.current) {
            if (hasScrolledToBottom) {
              scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth"
              });
            } else {
              scrollContainerRef.current.scrollTop =
                scrollContainerRef.current.scrollHeight;
              setHasScrolledToBottom(true);
            }
          }
        };

        const timer = setTimeout(scrollToBottom, hasScrolledToBottom ? 100 : 0);
        previousMessageCountRef.current = currentMessageCount;
        return () => clearTimeout(timer);
      }

      previousMessageCountRef.current = currentMessageCount;
    } else if (scrollContainerRef.current && transformedMessages.length === 0) {
      setHasScrolledToBottom(false);
      previousMessageCountRef.current = 0;
    }
  }, [transformedMessages, hasScrolledToBottom]);

  // Reset message count when chat changes
  useEffect(() => {
    previousMessageCountRef.current = 0;
    setHasScrolledToBottom(false);
  }, [chatId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const dates = Object.keys(dateRefs.current).sort();

      for (let i = dates.length - 1; i >= 0; i--) {
        const dateEl = dateRefs.current[dates[i]];
        if (dateEl && dateEl.offsetTop <= scrollTop + 20) {
          setStickyDate(dates[i]);
          return;
        }
      }

      setStickyDate(dates[0]);

      const container = scrollContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        10;
      if (isAtBottom) {
        setHasScrolledToBottom(true);
      } else {
        setHasScrolledToBottom(false);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [transformedMessages]);

  const groupMessagesByDate = (): Record<string, TransformedMessage[]> => {
    const grouped: Record<string, TransformedMessage[]> = {};

    transformedMessages.forEach((msg) => {
      const dateKey = moment(msg.timestamp).format("YYYY-MM-DD");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });

    return grouped;
  };

  const handleReply = (message: TransformedMessage) => {
    setReplyingTo({
      id: message.id,
      message: message.message,
      sender: message.sender.name
    });
    setEditingMessage(null);
  };

  const handleEdit = (message: TransformedMessage) => {
    setEditingMessage({
      id: message.id,
      message: message.message
    });
    setReplyingTo(null);
  };

  const handleSend = (
    content: string,
    attachments?: File[],
    replyToId?: string
  ) => {
    if (!chatId) {
      console.error("No chatId available");
      return;
    }

    if (editingMessage) {
      editMessageMutation(
        {
          messageId: editingMessage.id,
          content
        },
        {
          onSuccess: () => {
            setEditingMessage(null);
          },
          onError: (error: any) => {
            console.error("Failed to edit message:", error);
            toast.error(error.message || "Failed to edit message");
          }
        }
      );
      return;
    }

    if (!displayReceiverId) {
      console.error("Could not determine receiver ID. Chat:", currentChat);
      return;
    }

    sendMessageMutation(
      {
        chatId,
        receiverId: displayReceiverId,
        content,
        messageType: attachments && attachments.length > 0 ? "file" : "text",
        repliedToId: replyToId || null,
        attachments
      },
      {
        onSuccess: () => {
          setReplyingTo(null);
        },
        onError: (error: any) => {
          console.error("Failed to send message:", error);
          toast.error(error.message || "Failed to send message");
        }
      }
    );
  };

  const handleDelete = (messageId: string) => {
    deleteMessageMutation(messageId);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const groupedMessages = groupMessagesByDate();
  const sortedDates = Object.keys(groupedMessages).sort();

  if (isLoading || isLoadingChats) {
    return (
      <section className="flex-center h-full flex-col border-l text-sm">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading messages...
        </p>
      </section>
    );
  }

  if (!chatId) {
    router.replace("/chat");
    return null;
  }

  if (chatWasDeleted) {
    return <ChatDeletedEmptyState />;
  }

  return (
    <section className="flex flex-col overflow-hidden border-l text-sm">
      <div
        ref={scrollContainerRef}
        className="thin-scrollbar relative h-[calc(100vh-150px)] flex-1 overflow-y-auto"
      >
        {stickyDate && <DateDivider date={stickyDate} isSticky={true} />}

        <div className="h-full space-y-2 p-4">
          {sortedDates.length === 0 ? (
            <div className="flex-center h-full flex-col text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Start chatting with {displayReceiver?.full_name || "this user"}
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Send your first message to begin the conversation.
                {displayReceiver?.full_name &&
                  ` Your messages with ${displayReceiver.full_name} will appear here.`}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-xs text-muted-foreground">
                ● Welcome to ground zero of this conversation ●
              </p>
              {sortedDates.map((date) => (
                <div key={date}>
                  <div
                    ref={(el) => {
                      dateRefs.current[date] = el;
                    }}
                    style={{
                      opacity: stickyDate === date ? 0 : 1
                    }}
                  >
                    <DateDivider date={date} isSticky={false} />
                  </div>

                  <div className="pb-10">
                    {groupedMessages[date].map((msg, index) => {
                      const messagesOnDate = groupedMessages[date];
                      const prevMsg = messagesOnDate[index - 1];

                      const sameAsPrev =
                        prevMsg &&
                        prevMsg.sender.name === msg.sender.name &&
                        prevMsg.isOwn === msg.isOwn &&
                        moment(msg.timestamp).isSame(
                          moment(prevMsg.timestamp),
                          "minute"
                        );

                      const isGrouped = sameAsPrev;
                      const isFirstOfGroup = !sameAsPrev;

                      return (
                        <ChatBubble
                          key={msg.id}
                          message={msg.message}
                          time={msg.time}
                          sender={msg.sender}
                          isOwn={msg.isOwn}
                          isGrouped={isGrouped}
                          isFirstOfGroup={isFirstOfGroup}
                          isEdited={msg.isEdited}
                          editedAt={msg.editedAt}
                          repliedTo={msg.repliedTo}
                          isOptimistic={msg.isOptimistic}
                          attachments={msg.attachments}
                          onReply={() => handleReply(msg)}
                          onEdit={msg.isOwn ? () => handleEdit(msg) : undefined}
                          onDelete={
                            msg.isOwn ? () => handleDelete(msg.id) : undefined
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <ChatInput
        onSend={handleSend}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        onCancelReply={() => setReplyingTo(null)}
        onCancelEdit={handleCancelEdit}
        disabled={
          isSending || isEditing || (!displayReceiverId && !editingMessage)
        }
      />
    </section>
  );
};

export default ChatZone;
