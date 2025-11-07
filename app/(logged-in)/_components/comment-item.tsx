"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToggleInteraction } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-query-resource";
import { cn, formatCount, formatRelativeTime, getInitials } from "@/lib/utils";
import { Comment } from "@/services/posts.service";
import { m } from "framer-motion";
import { Ellipsis, MessageCircle, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
}

const CommentItem = ({
  comment,
  onReply,
  onDelete,
  depth = 0
}: CommentItemProps) => {
  const { user } = useAuth();
  const { mutate: toggleInteraction } = useToggleInteraction();
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = user?.id === comment.created_by;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleInteraction({
      targetType: "comment",
      targetId: comment.id,
      kind: "like"
    });
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    const commentInput = document.getElementById("comment-input-container");
    if (commentInput) {
      commentInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    onReply(comment);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(comment.id);
  };

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 border-l-2 pl-4")}>
      <m.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-[auto,1fr] gap-3"
      >
        <Link
          href={`/${comment.author?.username}`}
          className="h-fit"
          onClick={(e) => e.stopPropagation()}
        >
          <UserAvatar
            src={comment.author?.avatar_url}
            fallback={getInitials(comment.author?.full_name || "U")}
            className="h-8 w-8"
          />
        </Link>

        <div className="flex-1 space-y-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <Link
              href={`/${comment.author?.username}`}
              className="text-sm font-semibold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {comment.author?.full_name || "Unknown User"}
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.created_at)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm">{comment.content}</p>

          <div className="flex items-center gap-4">
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                comment.user_liked
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-blue-400"
              )}
              onClick={handleLike}
            >
              <ThumbsUp
                className={cn("h-4 w-4", comment.user_liked && "fill-blue-500")}
              />
              {comment.like_count > 0 && (
                <span>{formatCount(comment.like_count)}</span>
              )}
            </m.button>

            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
              onClick={handleReply}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reply</span>
            </m.button>

            {hasReplies && (
              <button
                className="text-xs font-medium text-muted-foreground hover:text-primary"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? "Hide" : "Show"} {comment.reply_count}{" "}
                {comment.reply_count === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </m.div>

      {/* Nested Replies */}
      {showReplies && hasReplies && (
        <div className="space-y-3">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
