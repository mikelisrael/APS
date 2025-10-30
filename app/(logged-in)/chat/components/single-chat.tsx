"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDeleteChat } from "@/hooks/use-chats";
import { formatChatTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Chat } from "@/services/chats.service";
import { CircleOff, MessageSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SingleChatProps {
  chat: Chat;
  onClick: () => void;
  isActive?: boolean;
}

const SingleChat = ({ chat, onClick, isActive }: SingleChatProps) => {
  const router = useRouter();
  const otherParticipant = chat.participants?.[0];
  const lastMessage = chat.last_message;
  const formattedTime = lastMessage
    ? formatChatTime(lastMessage.created_at)
    : null;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { mutate: deleteChatMutation, isPending } = useDeleteChat();

  const handleDeleteChat = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteChatMutation(chat.id, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        router.replace("/chat");
      }
    });
  };

  const handleOpenChat = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onClick();
  };

  const menuItems = (
    <>
      <DropdownMenuItem onClick={handleOpenChat}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Open Chat
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleDeleteChat}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Chat
      </DropdownMenuItem>
    </>
  );

  const contextMenuItems = (
    <>
      <ContextMenuItem onClick={handleOpenChat}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Open Chat
      </ContextMenuItem>
      <ContextMenuItem>
        <CircleOff className="mr-2 h-4 w-4" />
        Report & Block
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleDeleteChat}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Chat
      </ContextMenuItem>
    </>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="group relative">
            <div
              className={cn(
                `relative flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-3 hover:bg-accent`,
                {
                  "bg-accent/30 font-semibold before:absolute before:left-0 before:top-1/2 before:h-2/5 before:w-[2px] before:-translate-y-1/2 before:animate-stretch before:rounded-full before:bg-primary before:content-['']":
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
                <div className="flex-between mb-1 gap-0.5">
                  <h3 className="line-clamp-1 break-all font-medium">
                    {otherParticipant?.user?.full_name || "Unknown User"}
                  </h3>
                  {formattedTime && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {formattedTime}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-between gap-2">
                  <span className="line-clamp-1 text-muted-foreground">
                    {lastMessage?.content || "No messages yet"}
                  </span>
                  {chat.unread_count && chat.unread_count > 0 ? (
                    <div className="flex-center h-5 min-w-5 rounded-full bg-primary p-1 text-xs font-semibold text-primary-foreground">
                      {chat.unread_count > 99 ? "99+" : chat.unread_count}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>{contextMenuItems}</ContextMenuContent>
      </ContextMenu>

      <ResponsiveDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete Chat"
        submitButtonText="Delete"
        submitButtonVariant="destructive"
        onSubmit={confirmDelete}
        loading={isPending}
        className="max-w-sm"
      >
        Are you sure you want to delete this chat with
        <span className="font-semibold">
          {" "}
          {otherParticipant?.user?.full_name || "Unknown User"}
        </span>
        ? This action cannot be undone and all messages will be permanently
        deleted.
      </ResponsiveDialog>
    </>
  );
};

export default SingleChat;
