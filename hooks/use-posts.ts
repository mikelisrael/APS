import {
  useGetResource,
  useModifyResource,
  useAuth
} from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
  Comment,
  createComment,
  createPost,
  CreatePostData,
  deleteComment,
  deletePost,
  getPost,
  getPostComments,
  getPosts,
  InteractionKind,
  Post,
  PostKind,
  removeRsvp,
  RsvpStatus,
  rsvpToEvent,
  toggleInteraction,
  updateComment,
  updatePost,
  UpdatePostData
} from "@/services/posts.service";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Hook for infinite scroll posts
export const useInfinitePosts = (kind?: PostKind, pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: ["posts", kind],
    queryFn: ({ pageParam = 0 }) => getPosts(pageParam, pageSize, kind),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      posts: data.pages.flatMap((page) => page.posts)
    })
  });
};

// Hook for fetching a single post
export const usePost = (postId: string) => {
  return useGetResource({
    key: ["posts", postId],
    fn: () => getPost(postId),
    enabled: !!postId,
    onError: (error) => {
      toast.error(error.message || "Failed to load post");
    }
  });
};

// Hook for creating a post with optimistic updates
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: (data: CreatePostData) => createPost(data),
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });
};

// Hook for updating a post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: ({ postId, data }: { postId: string; data: UpdatePostData }) =>
      updatePost(postId, data),
    onMutate: async ({ postId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", postId] });

      const previousInfinite = queryClient.getQueriesData({
        queryKey: ["posts"]
      });
      const previousSingle = queryClient.getQueryData(["posts", postId]);

      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: Post) =>
              p.id === postId ? { ...p, ...data, _optimistic: true } : p
            )
          }))
        };
      });

      queryClient.setQueryData(["posts", postId], (old: any) => {
        if (!old) return old;
        return { ...old, ...data, _optimistic: true };
      });

      return { previousInfinite, previousSingle, postId };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousInfinite) {
        context.previousInfinite.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSingle) {
        queryClient.setQueryData(
          ["posts", context.postId],
          context.previousSingle
        );
      }
      toast.error(error.message || "Failed to update post");
    },
    onSuccess: (data, variables) => {
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: Post) =>
              p.id === variables.postId ? data : p
            )
          }))
        };
      });

      queryClient.setQueryData(["posts", variables.postId], data);
      toast.success("Post updated successfully");
    }
  });
};

// Hook for deleting a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: (postId: string) => deletePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousData = queryClient.getQueriesData({ queryKey: ["posts"] });

      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((p: Post) => p.id !== postId)
          }))
        };
      });

      return { previousData, postId };
    },
    onError: (error, postId, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to delete post");
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
    }
  });
};

// Hook for toggling interactions with optimistic updates
export const useToggleInteraction = () => {
  const queryClient = useQueryClient();
  const [pendingInteraction, setPendingInteraction] =
    useState<InteractionKind | null>(null);

  const mutation = useModifyResource({
    key: ["posts"],
    fn: ({
      targetType,
      targetId,
      kind
    }: {
      targetType: "post" | "comment";
      targetId: string;
      kind: InteractionKind;
    }) => {
      setPendingInteraction(kind);
      return toggleInteraction(targetType, targetId, kind).finally(() => {
        setPendingInteraction(null);
      });
    },
    onMutate: async ({ targetType, targetId, kind }) => {
      if (targetType === "post") {
        await queryClient.cancelQueries({ queryKey: ["posts"] });

        const previousData = queryClient.getQueriesData({
          queryKey: ["posts"]
        });

        queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: Post) => {
                if (p.id !== targetId) return p;

                const countField = `${kind}_count` as keyof Post;
                const interactionField = kind === "like" ? "liked" : "shared";
                const currentValue =
                  p.user_interaction?.[interactionField] || false;

                return {
                  ...p,
                  [countField]: Math.max(
                    0,
                    (p[countField] as number) + (currentValue ? -1 : 1)
                  ),
                  user_interaction: {
                    ...p.user_interaction,
                    [interactionField]: !currentValue
                  },
                  _optimistic: true
                };
              })
            }))
          };
        });

        return { previousData, targetType, targetId };
      }

      return { targetType, targetId };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to update interaction");
    },
    onSuccess: () => {
      // Silent success - optimistic update already applied
    }
  });

  return {
    ...mutation,
    pendingInteraction
  };
};

// Hook for fetching post comments
export const usePostComments = (postId: string) => {
  return useGetResource({
    key: ["posts", postId, "comments"],
    fn: () => getPostComments(postId),
    enabled: !!postId,
    select: (data) => data || [],
    onError: (error) => {
      toast.error(error.message || "Failed to load comments");
    }
  });
};

// Hook for creating a comment - simplified without optimistic updates
// Helper: Insert reply optimistically into nested comment tree
const insertReplyOptimistically = (
  comments: Comment[],
  parentId: string,
  newReply: Comment
): Comment[] => {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [newReply, ...(comment.replies || [])],
        reply_count: comment.reply_count + 1
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: insertReplyOptimistically(comment.replies, parentId, newReply)
      };
    }
    return comment;
  });
};

// Helper: Replace optimistic comment with real data
const replaceOptimisticComment = (
  comments: Comment[],
  realComment: Comment,
  optimisticId?: string
): Comment[] => {
  return comments.map((comment) => {
    // Match by temporary ID if provided, or by _optimistic flag + content match
    const isOptimistic = (comment as any)._optimistic;
    const matchesId = optimisticId ? comment.id === optimisticId : false;
    const matchesContent = isOptimistic && comment.content === realComment.content;

    if (matchesId || matchesContent) {
      return { ...realComment, user_liked: false, replies: comment.replies || [] };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: replaceOptimisticComment(comment.replies, realComment, optimisticId)
      };
    }
    return comment;
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useModifyResource({
    key: ["posts"],
    fn: ({
      postId,
      content,
      parentCommentId
    }: {
      postId: string;
      content: string;
      parentCommentId?: string;
    }) => createComment(postId, content, parentCommentId),
    onMutate: async ({ postId, content, parentCommentId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["posts", postId, "comments"]
      });

      // Snapshot the previous value for rollback
      const previousComments = queryClient.getQueryData([
        "posts",
        postId,
        "comments"
      ]);

      // Create optimistic comment with unique temp ID
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticComment: Comment & { _optimistic?: boolean } = {
        id: tempId,
        post_id: postId,
        parent_comment_id: parentCommentId || null,
        created_by: user?.id || null,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        depth: parentCommentId ? 1 : 0,
        like_count: 0,
        reply_count: 0,
        is_edited: false,
        user_liked: false,
        replies: [],
        author: {
          id: user?.id || "",
          full_name: user?.user_metadata?.full_name || "You",
          avatar_url: user?.user_metadata?.avatar_url,
          username: user?.user_metadata?.username || "you"
        },
        _optimistic: true
      };

      // Optimistically update the comments
      queryClient.setQueryData(
        ["posts", postId, "comments"],
        (old: Comment[] | undefined) => {
          if (!old) return [optimisticComment];

          if (!parentCommentId) {
            // Top-level comment - insert at beginning (current user priority)
            return [optimisticComment, ...old];
          } else {
            // Reply - insert into parent's replies array
            return insertReplyOptimistically(old, parentCommentId, optimisticComment);
          }
        }
      );

      // Return context for rollback including the temp ID
      return { previousComments, postId, tempId };
    },
    onError: (error: any, variables, context: any) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["posts", context.postId, "comments"],
          context.previousComments
        );
      }
      toast.error(error.message || "Failed to create comment");
    },
    onSuccess: (data, variables, context: any) => {
      if (!data || !data.post_id) {
        console.error("Invalid comment data returned from server");
        return;
      }

      // Replace optimistic comment with real data using the temp ID from context
      queryClient.setQueryData(
        ["posts", data.post_id, "comments"],
        (old: Comment[] | undefined) => {
          if (!old) return [data];
          return replaceOptimisticComment(old, data, context?.tempId);
        }
      );

      // Update post comment count optimistically
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: Post) =>
              p.id === data.post_id
                ? { ...p, comment_count: p.comment_count + 1 }
                : p
            )
          }))
        };
      });

      toast.success("Comment posted");
    }
  });
};

// Hook for updating a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update comment");
    }
  });
};

// Hook for deleting a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    }
  });
};

// Hook for RSVP to event
export const useRsvpToEvent = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: ({
      eventPostId,
      status
    }: {
      eventPostId: string;
      status: RsvpStatus;
    }) => rsvpToEvent(eventPostId, status),
    onMutate: async ({ eventPostId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousData = queryClient.getQueriesData({ queryKey: ["posts"] });

      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: Post) =>
              p.id === eventPostId
                ? { ...p, user_rsvp: status, _optimistic: true }
                : p
            )
          }))
        };
      });

      queryClient.setQueryData(["posts", eventPostId], (old: any) => {
        if (!old) return old;
        return { ...old, user_rsvp: status, _optimistic: true };
      });

      return { previousData, eventPostId };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to update RSVP");
    },
    onSuccess: () => {
      toast.success("RSVP updated");
    }
  });
};

// Hook for removing RSVP
export const useRemoveRsvp = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["posts"],
    fn: (eventPostId: string) => removeRsvp(eventPostId),
    onMutate: async (eventPostId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousData = queryClient.getQueriesData({ queryKey: ["posts"] });

      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: Post) =>
              p.id === eventPostId
                ? { ...p, user_rsvp: null, _optimistic: true }
                : p
            )
          }))
        };
      });

      queryClient.setQueryData(["posts", eventPostId], (old: any) => {
        if (!old) return old;
        return { ...old, user_rsvp: null, _optimistic: true };
      });

      return { previousData, eventPostId };
    },
    onError: (error, eventPostId, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "Failed to remove RSVP");
    },
    onSuccess: () => {
      toast.success("RSVP removed");
    }
  });
};

export const usePostsSubscription = (kind?: PostKind) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    let currentUserId: string | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserId = user?.id || null;
    });

    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts"
        },
        async (payload) => {
          if (kind && payload.new.kind !== kind) return;

          const { data: fullPost } = await supabase
            .from("posts")
            .select(
              `
              *,
              author:users!posts_created_by_fkey(id, full_name, avatar_url, username),
              attachments:post_attachments(*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullPost && currentUserId) {
            const { data: interactions } = await supabase
              .from("interactions")
              .select("kind")
              .eq("user_id", currentUserId)
              .eq("target_type", "post")
              .eq("target_id", fullPost.id);

            const userInteraction = {
              liked: false,
              shared: false
            };

            interactions?.forEach((int) => {
              if (int.kind === "like") userInteraction.liked = true;
              if (int.kind === "share") userInteraction.shared = true;
            });

            const postWithInteraction = {
              ...fullPost,
              user_interaction: userInteraction,
              user_rsvp: null
            };

            queryClient.setQueriesData(
              { queryKey: ["posts", kind] },
              (old: any) => {
                if (!old?.pages?.[0]) return old;

                const firstPage = old.pages[0];
                const postExists = firstPage.posts.some(
                  (p: Post) => p.id === fullPost.id
                );

                if (postExists) return old;

                return {
                  ...old,
                  pages: [
                    {
                      posts: [postWithInteraction, ...firstPage.posts],
                      hasMore: firstPage.hasMore
                    },
                    ...old.pages.slice(1)
                  ]
                };
              }
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts"
        },
        async (payload) => {
          if (!currentUserId) return;

          const { data: fullPost } = await supabase
            .from("posts")
            .select(
              `
              *,
              author:users!posts_created_by_fkey(id, full_name, avatar_url, username),
              attachments:post_attachments(*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullPost) {
            const { data: interactions } = await supabase
              .from("interactions")
              .select("kind")
              .eq("user_id", currentUserId)
              .eq("target_type", "post")
              .eq("target_id", fullPost.id);

            const userInteraction = {
              liked: false,
              reposted: false,
              shared: false
            };

            interactions?.forEach((int) => {
              if (int.kind === "like") userInteraction.liked = true;
              if (int.kind === "repost") userInteraction.reposted = true;
              if (int.kind === "share") userInteraction.shared = true;
            });

            const postWithInteraction = {
              ...fullPost,
              user_interaction: userInteraction,
              user_rsvp: fullPost.kind === "event" ? null : undefined
            };

            queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
              if (!old?.pages) return old;

              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  posts: page.posts.map((p: Post) =>
                    p.id === fullPost.id ? postWithInteraction : p
                  )
                }))
              };
            });

            queryClient.setQueryData(
              ["posts", fullPost.id],
              postWithInteraction
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts"
        },
        (payload) => {
          queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
            if (!old?.pages) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                posts: page.posts.filter((p: Post) => p.id !== payload.old.id)
              }))
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [kind, queryClient]);
};

// Real-time subscription for comments on a specific post
// Helper: Check if comment exists in tree (for duplicate detection)
const findCommentInTree = (comments: Comment[], id: string): boolean => {
  for (const comment of comments) {
    if (comment.id === id) return true;
    if (comment.replies && findCommentInTree(comment.replies, id)) return true;
  }
  return false;
};

// Helper: Sort comments with priority ordering
const sortComments = (
  comments: Comment[],
  currentUserId: string | undefined,
  postAuthorId: string | null
): Comment[] => {
  return [...comments].sort((a, b) => {
    // Priority 1: Current user's comments first
    if (a.created_by === currentUserId && b.created_by !== currentUserId) return -1;
    if (a.created_by !== currentUserId && b.created_by === currentUserId) return 1;

    // Priority 2: Post author's comments
    if (a.created_by === postAuthorId && b.created_by !== postAuthorId) return -1;
    if (a.created_by !== postAuthorId && b.created_by === postAuthorId) return 1;

    // Priority 3: Engagement score (likes + replies*2)
    const aEngagement = a.like_count + a.reply_count * 2;
    const bEngagement = b.like_count + b.reply_count * 2;
    if (aEngagement !== bEngagement) return bEngagement - aEngagement;

    // Priority 4: Recency
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

// Helper: Insert reply with proper sorting
const insertReplyWithSorting = (
  comments: Comment[],
  newReply: Comment,
  currentUserId: string | undefined,
  postAuthorId: string | null
): Comment[] => {
  return comments.map((comment) => {
    if (comment.id === newReply.parent_comment_id) {
      const updatedReplies = [
        ...(comment.replies || []),
        { ...newReply, user_liked: false, replies: [] }
      ];
      return {
        ...comment,
        replies: sortComments(updatedReplies, currentUserId, postAuthorId),
        reply_count: comment.reply_count + 1
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: insertReplyWithSorting(
          comment.replies,
          newReply,
          currentUserId,
          postAuthorId
        )
      };
    }
    return comment;
  });
};

// Helper: Remove comment from tree
const removeCommentFromTree = (comments: Comment[], id: string): Comment[] => {
  return comments
    .filter((comment) => comment.id !== id)
    .map((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: removeCommentFromTree(comment.replies, id)
        };
      }
      return comment;
    });
};

export const usePostCommentsSubscription = (postId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!postId) return;

    const supabase = createClient();
    let postAuthorId: string | null = null;

    // Fetch post author once for sorting logic
    supabase
      .from("posts")
      .select("created_by")
      .eq("id", postId)
      .single()
      .then(({ data }) => {
        postAuthorId = data?.created_by || null;
      });

    const channel = supabase
      .channel(`post-comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          const { data: fullComment } = await supabase
            .from("comments")
            .select(
              `
              *,
              author:users!comments_created_by_fkey(id, full_name, avatar_url, username)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullComment) {
            queryClient.setQueryData(
              ["posts", postId, "comments"],
              (old: Comment[] | undefined) => {
                if (!old) {
                  return [{ ...fullComment, user_liked: false, replies: [] }];
                }

                // Check if already exists (prevent duplicates from optimistic update)
                if (findCommentInTree(old, fullComment.id)) {
                  return old;
                }

                const currentUserId = user?.id;

                // If it's a reply, insert into parent's replies
                if (fullComment.parent_comment_id) {
                  return insertReplyWithSorting(
                    old,
                    fullComment,
                    currentUserId,
                    postAuthorId
                  );
                }

                // Top-level comment - insert with proper priority
                const newComment = { ...fullComment, user_liked: false, replies: [] };
                const updatedComments = [...old, newComment];

                // Re-sort top-level comments
                return sortComments(updatedComments, currentUserId, postAuthorId);
              }
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          // Invalidate to refetch - updates are less frequent
          queryClient.invalidateQueries({
            queryKey: ["posts", postId, "comments"]
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          queryClient.setQueryData(
            ["posts", postId, "comments"],
            (old: Comment[] | undefined) => {
              if (!old) return old;
              return removeCommentFromTree(old, payload.old.id);
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient, user?.id]);
};
