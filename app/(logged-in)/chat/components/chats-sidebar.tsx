"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useAllChatsSubscription, useUserChats } from "@/hooks/use-chats";
import { useAcceptedConnections } from "@/hooks/use-connections";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Chat } from "@/services/chats.service";
import { Search } from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { PiNotePencilThin } from "react-icons/pi";
import ChatSkeleton from "./chat-skeleton";
import NewConversationDialog from "./new-conversation-dialog";

interface SingleChatProps {
  chat: Chat;
  onClick: () => void;
  isActive?: boolean;
}

const SingleChat = ({ chat, onClick, isActive }: SingleChatProps) => {
  const otherParticipant = chat.participants?.[0];
  const lastMessage = chat.last_message;
  const timeAgo = lastMessage && moment(lastMessage?.created_at).fromNow();

  return (
    <div
      className={cn(
        `relative flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-3 hover:bg-accent`,
        {
          "before:animate-stretch bg-accent/30 before:absolute before:left-0 before:top-1/2 before:h-2/5 before:w-[2px] before:-translate-y-1/2 before:rounded-full before:bg-primary before:content-['']":
            isActive
        }
      )}
      onClick={onClick}
    >
      <UserAvatar
        src={otherParticipant?.user?.avatar_url}
        alt={otherParticipant?.user?.full_name || "User"}
      />

      <div className="grow text-sm">
        <div className="flex-between mb-1">
          <h3 className="font-medium">
            {otherParticipant?.user?.full_name || "Unknown User"}
          </h3>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <div className="flex-between gap-2">
          <span className="line-clamp-1 text-muted-foreground">
            {lastMessage?.content || "No messages yet"}
          </span>
          {chat.unread_count && chat.unread_count > 0 ? (
            <div className="flex-center h-5 min-w-5 rounded-full bg-primary p-1 text-xs text-primary-foreground">
              {chat.unread_count > 99 ? "99+" : chat.unread_count}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Chats = () => {
  const router = useRouter();
  const { ["chat-id"]: activeChatId } = useParams();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openNewChat, setOpenNewChat] = useState(false);
  const [connectionSearch, setConnectionSearch] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const debouncedConnectionSearch = useDebounce(connectionSearch, 300);

  const { data: chats, isLoading, refetch } = useUserChats();
  const { data: connections, isLoading: isLoadingConnections } =
    useAcceptedConnections();

  // Subscribe to real-time updates
  useAllChatsSubscription(() => {
    refetch();
  });

  const filteredChats = useMemo(() => {
    if (!chats) return [];

    if (!debouncedQuery) return chats;

    const query = debouncedQuery.toLowerCase();
    return chats.filter((chat: Chat) => {
      const otherParticipant = chat.participants?.[0];
      const name = otherParticipant?.user?.full_name?.toLowerCase() || "";
      const lastMessageContent =
        chat.last_message?.content?.toLowerCase() || "";

      return name.includes(query) || lastMessageContent.includes(query);
    });
  }, [chats, debouncedQuery]);

  // Calculate total unread count
  const totalUnreadCount = useMemo(() => {
    return (
      chats?.reduce(
        (total: number, chat: Chat) => total + (chat.unread_count || 0),
        0
      ) || 0
    );
  }, [chats]);

  return (
    <section className="safe-area relative flex h-svh flex-col pr-2">
      <header className="flex-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="page-title !px-0">Chats</h1>
          {totalUnreadCount > 0 && (
            <span className="flex-center h-6 min-w-6 rounded-full bg-primary px-2 text-xs text-primary-foreground">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenNewChat(true)}
        >
          <PiNotePencilThin size="20" />
        </Button>
      </header>

      <div className="mt-5 flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search chats..."
          className="grow bg-card text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto pb-10 pt-3">
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <ChatSkeleton key={index} />
            ))}
          </>
        ) : filteredChats.length === 0 ? (
          <div className="flex-center flex-col py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search size={20} className="text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              {debouncedQuery ? "No chats found" : "No conversations yet"}
            </p>
            <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
              {debouncedQuery
                ? "Try searching with a different name or keyword"
                : "Start connecting with your network and begin conversations"}
            </p>
            {!debouncedQuery && (
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={() => setOpenNewChat(true)}
              >
                <PiNotePencilThin size={14} />
                Start a conversation
              </button>
            )}
          </div>
        ) : (
          filteredChats.map((chat: Chat) => (
            <SingleChat
              key={chat.id}
              chat={chat}
              onClick={() =>
                router.replace(`/chat/${chat.id}`, {
                  scroll: false
                })
              }
              isActive={activeChatId === chat.id}
            />
          ))
        )}
      </div>

      <div
        className="pointer-events-none absolute bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent dark:from-[#121212]"
        aria-hidden="true"
      />

      <NewConversationDialog
        connectionSearch={connectionSearch}
        setConnectionSearch={setConnectionSearch}
        debouncedConnectionSearch={debouncedConnectionSearch}
        connections={connections}
        openNewChat={openNewChat}
        setOpenNewChat={setOpenNewChat}
        isLoadingConnections={isLoadingConnections}
      />
    </section>
  );
};

export default Chats;
