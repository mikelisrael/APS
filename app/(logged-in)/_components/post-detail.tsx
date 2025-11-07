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
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
  usePost,
  usePostComments,
  usePostCommentsSubscription,
  useToggleInteraction
} from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-query-resource";
import { cn, formatCount, formatRelativeTime } from "@/lib/utils";
import { Comment } from "@/services/posts.service";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion
} from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Ellipsis,
  Flag,
  Loader2,
  MessageCircle,
  Newspaper,
  Send,
  ThumbsUp,
  Trash2
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentInput from "./comment-input";
import CommentItem from "./comment-item";

interface PostDetailProps {
  postId: string;
}

const PostDetail = ({ postId }: PostDetailProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: post, isLoading, isError } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } =
    usePostComments(postId);
  const { mutate: deletePost } = useDeletePost();
  const { mutate: toggleInteraction } = useToggleInteraction();
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment();
  const { mutate: deleteComment } = useDeleteComment();

  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    author: string;
    content: string;
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Subscribe to real-time comment updates
  usePostCommentsSubscription(postId);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(postId);
      router.back();
    }
  };

  const handleInteraction = (
    e: React.MouseEvent,
    kind: "like" | "repost" | "share"
  ) => {
    e.stopPropagation();
    toggleInteraction({
      targetType: "post",
      targetId: postId,
      kind
    });
  };

  const handleSubmitComment = (content: string, parentCommentId?: string) => {
    // Clear reply state immediately when submitting
    if (replyingTo) {
      setReplyingTo(null);
    }

    createComment({
      postId,
      content,
      parentCommentId
    });
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo({
      id: comment.id,
      author: comment.author?.full_name || "Unknown User",
      content: comment.content
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete);
      setShowDeleteDialog(false);
      setCommentToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <section className="flex-center mt-5 min-h-[400px] border-t">
        <LoaderSpinner />
      </section>
    );
  }

  if (isError || !post) {
    return (
      <section className="flex-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load post
          </p>
          <p className="text-sm text-muted-foreground">
            This post may have been deleted or you don&apos;t have permission to
            view it
          </p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </section>
    );
  }

  const isOwner = user?.id === post.created_by;

  const getPostTypeIndicator = () => {
    if (post.kind === "article") {
      return (
        <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Newspaper className="h-4 w-4" />
          <span>Article</span>
        </div>
      );
    }
    if (post.kind === "event") {
      return (
        <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Event</span>
        </div>
      );
    }
    return null;
  };

  return (
    <LazyMotion features={domAnimation}>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              comment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto mt-5 max-w-3xl border-t ~px-2/7 ~py-5/8">
        {/* Header with Back Button */}
        <div className="mb-2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>

        {/* Post Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-t-lg border-x border-t bg-card px-6 pt-6"
        >
          <div className="grid grid-cols-[auto,1fr] gap-3">
            <Link href={`/${post.author?.username}`} className="h-fit">
              <UserAvatar src={post.author?.avatar_url} className="h-12 w-12" />
            </Link>

            <div className="flex-1">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/${post.author?.username}`}
                    className="font-semibold hover:underline"
                  >
                    {post.author?.full_name || "Unknown User"}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    @{post.author?.username || "unknown"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(post.created_at)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Ellipsis className="h-5 w-5 text-muted-foreground" />
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
                </div>
              </header>

              <div className="mt-4 space-y-4">
                {getPostTypeIndicator()}

                {/* Article Title */}
                {post.kind === "article" && post.title && (
                  <h2 className="text-2xl font-bold tracking-tight">
                    {post.title}
                  </h2>
                )}

                {/* Event Title and Date */}
                {post.kind === "event" && (
                  <div className="space-y-3">
                    {post.title && (
                      <h2 className="text-2xl font-bold tracking-tight">
                        {post.title}
                      </h2>
                    )}
                    {post.event_date && (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          {moment(post.event_date).format("dddd, MMMM D, YYYY")}
                        </span>
                        <span className="text-muted-foreground">at</span>
                        <span className="font-medium">
                          {moment(post.event_date).format("h:mm A")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Content */}
                {post.content && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {post.content}
                  </p>
                )}

                {/* Reference Text */}
                {post.reference_text && (
                  <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-4">
                    <p className="text-sm italic text-muted-foreground">
                      {post.reference_text}
                    </p>
                  </div>
                )}
              </div>

              {/* Interaction Stats */}
              <div className="mt-6 flex items-center gap-6 py-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    post.user_interaction?.liked
                      ? "text-blue-500"
                      : "text-muted-foreground hover:text-blue-400"
                  )}
                  onClick={(e) => handleInteraction(e, "like")}
                >
                  <ThumbsUp
                    className={cn(
                      "h-5 w-5",
                      post.user_interaction?.liked && "fill-blue-500"
                    )}
                  />
                  <span className="font-medium">
                    {formatCount(post.like_count)}
                  </span>
                </motion.button>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {formatCount(post.comment_count)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    post.user_interaction?.shared
                      ? "text-amber-500"
                      : "text-muted-foreground hover:text-amber-400"
                  )}
                  onClick={(e) => handleInteraction(e, "share")}
                >
                  <Send
                    className={cn(
                      "h-5 w-5",
                      post.user_interaction?.shared && "fill-amber-500"
                    )}
                  />
                  <span className="font-medium">
                    {formatCount(post.share_count)}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <section className="space-y-6">
          <div className="rounded-b-lg border bg-card px-6 py-3">
            <CommentInput
              onSubmit={handleSubmitComment}
              isPending={isCreatingComment}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Comments</h2>
              {isCreatingComment && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {commentsLoading ? (
              <div className="flex-center py-8">
                <LoaderSpinner />
              </div>
            ) : comments && comments.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {comments.map((comment: Comment) => (
                  <motion.div
                    key={comment.id}
                    layout
                    className="rounded-lg border bg-card p-4"
                  >
                    <CommentItem
                      comment={comment}
                      onReply={handleReply}
                      onDelete={handleDeleteComment}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex-center rounded-lg border bg-card py-12">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">No comments yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to share your thoughts
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default PostDetail;
