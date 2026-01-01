"use client";

import UserAvatar from "@/components/shared/user-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToggleInteraction } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-query-resource";
import { useSharePost } from "@/hooks/use-share-post";
import { cn, formatCount, formatRelativeTime } from "@/lib/utils";
import { Post } from "@/services/posts.service";
import { m } from "framer-motion";
import {
  Calendar,
  Ellipsis,
  Flag,
  LoaderCircle,
  MessageCircle,
  Newspaper,
  Send,
  ThumbsUp,
  Trash2
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ImageLightbox from "./image-light-box";
import PostImageGrid from "./post-image-grid";
import ShareDialog from "./share-dialog";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: toggleInteraction, pendingInteraction } =
    useToggleInteraction();
  const { mutate: handleShare, isPending: isSharing } = useSharePost();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const isOwner = user?.id === post.created_by;

  const handleInteraction = (e: React.MouseEvent, kind: "like") => {
    e.stopPropagation();
    toggleInteraction({
      targetType: "post",
      targetId: post.id,
      kind
    });
  };

  const handleCardClick = () => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(`/post/${post.id}`);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareDialog(true);
  };

  const handleShareComplete = () => {
    // Record the share action using the hook
    handleShare(post.id);
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
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
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                if (onDelete) onDelete(post.id);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        postId={post.id}
        postTitle={post.title || undefined}
        postContent={post.content || undefined}
        onShareComplete={handleShareComplete}
      />

      {/* Image Lightbox */}
      {post.attachments && post.attachments.length > 0 && (
        <ImageLightbox
          images={post.attachments}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      <m.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative grid cursor-pointer grid-cols-[auto,1fr] gap-2 rounded-lg border bg-card px-5 pt-5 transition-colors hover:bg-accent/50",
          (isPending || isNavigating) && "pointer-events-none opacity-60"
        )}
        onClick={handleCardClick}
      >
        {(isPending || isNavigating) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <Link
          href={`/${post.author?.username}`}
          onClick={(e) => e.stopPropagation()}
          className="h-fit"
        >
          <UserAvatar src={post.author?.avatar_url} className="h-10 w-10" />
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

            {post.kind === "article" && post.title && (
              <h2 className="mb-2 text-lg font-bold tracking-tight">
                {post.title}
              </h2>
            )}

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
                      {moment(post.event_date).format(
                        "ddd, MMM D, YYYY h:mm A"
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {post.content && (
              <p
                className="line-clamp-5 whitespace-pre-wrap text-sm"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  hyphens: "auto"
                }}
              >
                {post.content}
              </p>
            )}

            {post.reference_text && (
              <div className="mt-3 rounded-md border-l-4 border-primary bg-muted/50 p-3">
                <p className="text-xs italic text-muted-foreground">
                  {post.reference_text}
                </p>
              </div>
            )}

            {/* Image Grid */}
            {post.attachments && post.attachments.length > 0 && (
              <PostImageGrid
                attachments={post.attachments}
                onImageClick={handleImageClick}
              />
            )}
          </div>

          <footer
            className="flex items-center gap-6 py-5"
            onClick={(e) => e.stopPropagation()}
          >
            <m.div
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
              {pendingInteraction === "like" ? (
                <LoaderCircle
                  size={20}
                  className="animate-spin text-blue-500"
                />
              ) : (
                <ThumbsUp
                  className={cn(
                    "size-5",
                    post.user_interaction?.liked && "fill-blue-500"
                  )}
                />
              )}
              <span>{formatCount(post.like_count)}</span>
            </m.div>

            <m.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground transition-colors hover:text-red-400"
              onClick={handleCardClick}
            >
              <MessageCircle className="size-5" />
              <span>{formatCount(post.comment_count)}</span>
            </m.div>

            <m.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground transition-colors hover:text-amber-400"
              onClick={handleShareClick}
            >
              {isSharing ? (
                <LoaderCircle
                  size={20}
                  className="animate-spin text-amber-500"
                />
              ) : (
                <Send className="size-5" />
              )}
              <span>{formatCount(post.share_count)}</span>
            </m.div>
          </footer>
        </section>
      </m.article>
    </>
  );
};

export default PostCard;
