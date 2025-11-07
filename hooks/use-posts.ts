import { useGetResource, useModifyResource } from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
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
import { useEffect } from "react";
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

  return useModifyResource({
    key: ["posts"],
    fn: ({
      targetType,
      targetId,
      kind
    }: {
      targetType: "post" | "comment";
      targetId: string;
      kind: InteractionKind;
    }) => toggleInteraction(targetType, targetId, kind),
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
export const useCreateComment = () => {
  const queryClient = useQueryClient();

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
    onSuccess: (data) => {
      if (!data?.post_id) {
        console.error("No post_id found in comment data");
        return;
      }

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["posts", data.post_id, "comments"]
      });

      // Also invalidate the posts query to update comment count
      queryClient.invalidateQueries({
        queryKey: ["posts"]
      });

      toast.success("Comment posted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create comment");
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

// Real-time subscription for posts - PROPERLY FIXED
export const usePostsSubscription = (kind?: PostKind) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    // Get current user for filtering interactions
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
              author:users!posts_created_by_fkey(id, full_name, avatar_url, username)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullPost && currentUserId) {
            // Get user interactions
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
              author:users!posts_created_by_fkey(id, full_name, avatar_url, username)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullPost) {
            // Get user interactions
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

            // Update all posts queries
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
export const usePostCommentsSubscription = (postId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    const supabase = createClient();

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
              author:users!comments_created_by_fkey(id, full_name, avatar_url)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullComment) {
            queryClient.setQueryData(
              ["posts", postId, "comments"],
              (old: any) => {
                if (!old) return [{ ...fullComment, replies: [] }];

                const exists = old.some((c: any) => c.id === fullComment.id);
                if (exists) return old;

                return [...old, { ...fullComment, replies: [] }];
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
            (old: any) => {
              if (!old) return old;
              return old.filter((c: any) => c.id !== payload.old.id);
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);
};
