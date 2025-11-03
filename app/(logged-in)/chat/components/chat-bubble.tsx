import UserAvatar from "@/components/shared/user-avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Copy, Edit, Flag, MoreVertical, Reply, Trash2 } from "lucide-react";

interface Sender {
  name: string;
  avatar: string;
}

interface RepliedMessage {
  id: string;
  message: string;
  sender: string;
  isOwn?: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  action?: () => void;
  className?: string;
}

interface ChatBubbleProps {
  message: string;
  time: string;
  sender: Sender;
  isOwn: boolean;
  isGrouped: boolean;
  isFirstOfGroup: boolean;
  isEdited?: boolean;
  editedAt?: string | null;
  repliedTo?: RepliedMessage | null;
  onReply?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isOptimistic?: boolean;
}

const ChatBubble = ({
  message,
  time,
  sender,
  isOwn,
  isGrouped,
  isFirstOfGroup,
  isEdited = false,
  editedAt,
  repliedTo,
  onReply,
  onDelete,
  onEdit,
  isOptimistic = false
}: ChatBubbleProps) => {
  const showAvatar = !isGrouped;
  const showName = isFirstOfGroup;

  const baseMenuItems: MenuItem[] = [
    { label: "Reply", icon: Reply, action: onReply },
    {
      label: "Copy",
      icon: Copy,
      action: () => navigator.clipboard.writeText(message)
    },
    { label: "Report", icon: Flag, action: () => {} }
  ];

  const menuItems: MenuItem[] = isOwn
    ? [
        { label: "Edit", icon: Edit, action: onEdit },
        ...baseMenuItems,
        {
          label: "Delete",
          icon: Trash2,
          className: "text-destructive",
          action: onDelete
        }
      ]
    : baseMenuItems;

  return (
    <div
      className={cn(
        "group flex items-start gap-2.5 transition-opacity",
        isOwn && "flex-row-reverse",
        isGrouped ? "mt-[5px]" : "mt-4",
        isOptimistic && "opacity-60"
      )}
    >
      <UserAvatar
        className={cn("h-8 w-8 transition-opacity", !showAvatar && "opacity-0")}
        src={sender.avatar}
        alt={sender.name}
      />

      <ContextMenu>
        <ContextMenuTrigger>
          <>
            {repliedTo && (
              <div
                className={cn(
                  "mb-1 flex w-full max-w-[320px] items-start gap-2 border-l-4 px-2",
                  isOwn && "flex-row-reverse border-l-0 border-r-4"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <Reply className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {repliedTo.isOwn ? "You" : repliedTo.sender}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {repliedTo.message}
                  </p>
                </div>
              </div>
            )}

            <div
              className={cn(
                "flex max-w-[320px] flex-col",
                isOwn ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "relative p-4 transition-all",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                  isFirstOfGroup
                    ? isOwn
                      ? "rounded-bl-xl rounded-br-xl rounded-tl-xl"
                      : "rounded-bl-xl rounded-br-xl rounded-tr-xl"
                    : "rounded-xl"
                )}
              >
                {showName && (
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isOwn ? "text-primary-foreground" : "text-foreground"
                      )}
                    >
                      {isOwn ? "You" : sender.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {time}
                    </span>

                    {!isOptimistic && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="ml-auto rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100 dark:hover:bg-white/10">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align={isOwn ? "end" : "start"}
                          className="w-40"
                        >
                          {menuItems.map((item) => (
                            <DropdownMenuItem
                              key={item.label}
                              className={item.className}
                              onClick={item.action}
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}

                <p className="whitespace-pre-wrap break-words text-sm">
                  {message}
                </p>

                {/* Edited Indicator */}
                {isEdited && !isOptimistic && (
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={cn(
                        "text-[10px] italic",
                        isOwn
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      )}
                    >
                      Edited
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          {!isOptimistic &&
            menuItems.map((item) => (
              <ContextMenuItem
                key={item.label}
                className={item.className}
                onClick={item.action}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </ContextMenuItem>
            ))}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};

export default ChatBubble;
