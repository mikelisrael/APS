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
import { ChatAttachment } from "@/services/chats.service";
import { AnimatePresence, m } from "framer-motion";
import { Copy, Edit, Flag, MoreVertical, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import { AttachmentPreview } from "./attachment-preview";
import LinkPreview from "./link-preview";

interface Sender {
  name: string;
  avatar: string;
  username?: string;
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
  messageId: string;
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
  attachments?: ChatAttachment[];
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Extract first URL from text
const extractFirstUrl = (text: string): string | null => {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
};

// Message text component with clickable links
const MessageText = ({ text, isOwn }: { text: string; isOwn: boolean }) => {
  const parts = text.split(URL_REGEX);

  return (
    <p className="whitespace-pre-wrap break-words text-sm">
      {parts.map((part, index) => {
        if (part.match(URL_REGEX)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "break-all underline transition-colors hover:no-underline",
                isOwn
                  ? "text-primary-foreground/90 hover:text-primary-foreground"
                  : "text-primary hover:text-primary/80"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

const ChatBubble = ({
  messageId,
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
  isOptimistic = false,
  attachments = []
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

  // Animation variants
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      x: isOwn ? 20 : -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: isOwn ? 20 : -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const avatarVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: showAvatar ? 1 : 0,
      scale: 1,
      transition: {
        delay: 0.1,
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <m.div
      key={messageId}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn(
        "group flex items-start gap-2.5",
        isOwn && "flex-row-reverse",
        isGrouped ? "mt-[5px]" : "mt-4",
        isOptimistic && "!opacity-60"
      )}
    >
      <m.div variants={avatarVariants}>
        {sender.username ? (
          <Link
            href={`/${sender.username}`}
            onClick={(e) => e.stopPropagation()}
          >
            <UserAvatar
              className="h-8 w-8"
              src={sender.avatar}
              alt={sender.name}
            />
          </Link>
        ) : (
          <UserAvatar
            className="h-8 w-8"
            src={sender.avatar}
            alt={sender.name}
          />
        )}
      </m.div>

      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex flex-col">
            <AnimatePresence>
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
            </AnimatePresence>

            <m.div
              variants={contentVariants}
              className={cn(
                "flex max-w-[320px] flex-col",
                isOwn ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <m.div
                className={cn(
                  "relative cursor-pointer select-none p-4 transition-all",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                  isFirstOfGroup
                    ? isOwn
                      ? "rounded-bl-xl rounded-br-xl rounded-tl-xl"
                      : "rounded-bl-xl rounded-br-xl rounded-tr-xl"
                    : "rounded-xl"
                )}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (onReply && !isOptimistic) {
                    onReply();
                  }
                }}
              >
                {showName && (
                  <m.div
                    variants={itemVariants}
                    className="mb-1 flex items-center gap-2"
                  >
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
                          <m.button
                            className="ml-auto rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100 dark:hover:bg-white/10"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </m.button>
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
                  </m.div>
                )}

                {/* Attachments - placed before message text */}
                <AnimatePresence>
                  {attachments && attachments.length > 0 && (
                    <m.div variants={itemVariants} className="mb-3 space-y-2">
                      {attachments.map((attachment, index) => (
                        <m.div
                          key={attachment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <AttachmentPreview
                            attachment={attachment}
                            isOwn={isOwn}
                          />
                        </m.div>
                      ))}
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Link Preview */}
                {message && (
                  <m.div variants={itemVariants}>
                    {!isOptimistic && extractFirstUrl(message) && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ delay: 0.2 }}
                      >
                        <LinkPreview
                          url={extractFirstUrl(message)!}
                          isOwn={isOwn}
                        />
                      </m.div>
                    )}
                    <MessageText text={message} isOwn={isOwn} />
                  </m.div>
                )}

                {/* Edited Indicator */}
                <AnimatePresence>
                  {isEdited && !isOptimistic && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 flex items-center gap-1"
                    >
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
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            </m.div>
          </div>
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
    </m.div>
  );
};

export default ChatBubble;
