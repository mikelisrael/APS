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
import { Copy, Flag, Forward, MoreVertical, Reply, Trash2 } from "lucide-react";

interface Sender {
  name: string;
  avatar: string;
}

interface ChatBubbleProps {
  message: string;
  time: string;
  sender: Sender;
  isOwn: boolean;
  isGrouped: boolean;
  isFirstOfGroup: boolean;
}

const ChatBubble = ({
  message,
  time,
  sender,
  isOwn,
  isGrouped,
  isFirstOfGroup
}: ChatBubbleProps) => {
  const showAvatar = !isGrouped;
  const showName = isFirstOfGroup;

  const menuItems = [
    { label: "Reply", icon: Reply, className: "" },
    { label: "Forward", icon: Forward, className: "" },
    { label: "Copy", icon: Copy, className: "" },
    { label: "Report", icon: Flag, className: "" },
    { label: "Delete", icon: Trash2, className: "text-destructive" }
  ];

  return (
    <div
      className={cn(
        "group flex items-start gap-2.5",
        isOwn && "flex-row-reverse",
        isGrouped ? "mt-[5px]" : "mt-4"
      )}
    >
      <UserAvatar
        className={cn(
          "h-8 w-8 transition-opacity duration-200",
          !showAvatar && "opacity-0"
        )}
        src={sender.avatar}
        alt={sender.name}
      />

      <div className={cn("flex max-w-[320px] flex-col", isOwn && "items-end")}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "leading-1.5 relative p-4 transition-all",
                isOwn
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white",
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
                    {sender.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {time}
                  </span>

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
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <p
                className={cn(
                  "text-sm",
                  isOwn ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {message}
              </p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-40">
            {menuItems.map((item) => (
              <ContextMenuItem key={item.label} className={item.className}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
};

export default ChatBubble;
