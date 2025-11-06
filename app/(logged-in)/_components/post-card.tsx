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
import { Post } from "@/services/posts.service";
import { motion } from "framer-motion";
import {
  Calendar,
  Ellipsis,
  Flag,
  MessageCircle,
  Newspaper,
  Repeat2,
  Send,
  ThumbsUp,
  Trash2
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: toggleInteraction } = useToggleInteraction();

  const isOwner = user?.id === post.created_by;

  const handleInteraction = (
    e: React.MouseEvent,
    kind: "like" | "repost" | "share"
  ) => {
    e.stopPropagation();
    toggleInteraction({
      targetType: "post",
      targetId: post.id,
      kind
    });
  };

  const handleCardClick = () => {
    router.push(`?post=${post.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const getPostTypeIndicator = () => {
    if (post.kind === "article") {
      return (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Newspaper className="h-3.5 w-3.5" />
          <span>Article</span>
        </div>
      );
    }
    if (post.kind === "event") {
      return (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Event</span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid cursor-pointer grid-cols-[auto,1fr] gap-2 rounded-lg border bg-card px-5 pt-5 transition-colors hover:bg-accent/50"
      onClick={handleCardClick}
    >
      <Link
        href={`/${post.author?.username}`}
        onClick={(e) => e.stopPropagation()}
        className="h-fit"
      >
        <UserAvatar
          src={post.author?.avatar_url}
          fallback={getInitials(post.author?.full_name || "Unknown User")}
          className="h-10 w-10"
        />
      </Link>

      <section>
        <header className="flex-center justify-between gap-5">
          <div className="flex-1">
            <header className="flex items-center gap-2">
              <Link
                href={`/${post.author?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="line-clamp-1 font-semibold tracking-tight hover:underline"
              >
                {post.author?.full_name || "Unknown User"}
              </Link>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {formatRelativeTime(post.created_at)}
              </span>
            </header>
            <span className="block -translate-y-0.5 text-xs text-muted-foreground">
              @{post.author?.username || "unknown"}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Ellipsis className="size-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" /> Report post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="my-3">
          {getPostTypeIndicator()}

          {/* Article Title */}
          {post.kind === "article" && post.title && (
            <h2 className="mb-2 text-lg font-bold tracking-tight">
              {post.title}
            </h2>
          )}

          {/* Event Title and Date */}
          {post.kind === "event" && (
            <div className="mb-3 space-y-2">
              {post.title && (
                <h2 className="text-lg font-bold tracking-tight">
                  {post.title}
                </h2>
              )}
              {post.event_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {moment(post.event_date).format("ddd, MMM D, YYYY h:mm A")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Post Content */}
          {post.content && (
            <p className="line-clamp-4 whitespace-pre-wrap text-sm">
              {post.content}
            </p>
          )}

          {/* Reference Text */}
          {post.reference_text && (
            <div className="mt-3 rounded-md border-l-4 border-primary bg-muted/50 p-3">
              <p className="text-xs italic text-muted-foreground">
                {post.reference_text}
              </p>
            </div>
          )}
        </div>

        <footer
          className="flex items-center gap-6 py-5"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex-center cursor-pointer gap-1 text-sm transition-colors",
              post.user_interaction?.liked
                ? "text-blue-500"
                : "text-muted-foreground hover:text-blue-400"
            )}
            onClick={(e) => handleInteraction(e, "like")}
          >
            <ThumbsUp
              className={cn(
                "size-5",
                post.user_interaction?.liked && "fill-blue-500"
              )}
            />
            <span>{formatCount(post.like_count)}</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground transition-colors hover:text-red-400"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="size-5" />
            <span>{formatCount(post.comment_count)}</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex-center cursor-pointer gap-1 text-sm transition-colors",
              post.user_interaction?.reposted
                ? "text-pink-500"
                : "text-muted-foreground hover:text-pink-400"
            )}
            onClick={(e) => handleInteraction(e, "repost")}
          >
            <Repeat2
              className={cn(
                "size-5",
                post.user_interaction?.reposted && "fill-pink-500"
              )}
            />
            <span>{formatCount(post.repost_count)}</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex-center cursor-pointer gap-1 text-sm transition-colors",
              post.user_interaction?.shared
                ? "text-amber-500"
                : "text-muted-foreground hover:text-amber-400"
            )}
            onClick={(e) => handleInteraction(e, "share")}
          >
            <Send
              className={cn(
                "size-5",
                post.user_interaction?.shared && "fill-amber-500"
              )}
            />
            <span>{formatCount(post.share_count)}</span>
          </motion.div>
        </footer>
      </section>
    </motion.article>
  );
};

export default PostCard;
