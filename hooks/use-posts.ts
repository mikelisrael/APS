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
  rsvpToEvent,
  RsvpStatus,
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
    onMutate: async (newPost: CreatePostData) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        ...newPost,
        content: newPost.content || null,
        title: newPost.title || null,
        event_date: newPost.event_date || null,
        reference_text: newPost.reference_text || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        repost_count: 0,
        share_count: 0,
        author: {
          id: user.id,
          full_name: user.user_metadata?.full_name || "You",
          avatar_url: user.user_metadata?.avatar_url || ""
        },
        user_interaction: { liked: false, reposted: false, shared: false },
        user_rsvp: null,
        _optimistic: true
      } as any;

      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: [
            {
              posts: [optimisticPost, ...old.pages[0].posts],
              hasMore: old.pages[0].hasMore
            },
            ...old.pages.slice(1)
          ]
        };
      });

      return { optimisticPost };
    },
    onError: (error, variables, context: any) => {
      if (context?.optimisticPost) {
        queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any, idx: number) => {
              if (idx === 0) {
                return {
                  ...page,
                  posts: page.posts.filter(
                    (p: Post) => p.id !== context.optimisticPost.id
                  )
                };
              }
              return page;
            })
          };
        });
      }
      toast.error(error.message || "Failed to create post");
    },
    onSuccess: (data, variables, context: any) => {
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) => {
            if (idx === 0) {
              return {
                ...page,
                posts: page.posts.map((p: Post) =>
                  p.id === context?.optimisticPost?.id ? data : p
                )
              };
            }
            return page;
          })
        };
      });
      toast.success("Post created successfully");
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

      // Update in infinite queries
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old) return old;

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

      // Update single post
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
        if (!old) return old;

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
        if (!old) return old;

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
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: Post) => {
                if (p.id !== targetId) return p;

                const countField = `${kind}_count` as keyof Post;
                const interactionField =
                  kind === "like"
                    ? "liked"
                    : kind === "repost"
                      ? "reposted"
                      : "shared";
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
    onSuccess: (data, variables) => {
      // Silent success, counts already updated optimistically
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

// Hook for creating a comment
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
    onMutate: async ({ postId, content, parentCommentId }) => {
      await queryClient.cancelQueries({
        queryKey: ["posts", postId, "comments"]
      });

      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const previousComments = queryClient.getQueryData([
        "posts",
        postId,
        "comments"
      ]);

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        parent_comment_id: parentCommentId || null,
        created_by: user.id,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        depth: 0,
        like_count: 0,
        reply_count: 0,
        author: {
          id: user.id,
          full_name: user.user_metadata?.full_name || "You",
          avatar_url: user.user_metadata?.avatar_url || ""
        },
        user_liked: false,
        replies: [],
        _optimistic: true
      };

      queryClient.setQueryData(["posts", postId, "comments"], (old: any) =>
        old ? [...old, optimisticComment] : [optimisticComment]
      );

      // Update comment count in posts
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: Post) =>
              p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
            )
          }))
        };
      });

      return { previousComments, optimisticComment, postId };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["posts", context.postId, "comments"],
          context.previousComments
        );
      }
      toast.error(error.message || "Failed to create comment");
    },
    onSuccess: (data, variables, context: any) => {
      queryClient.setQueryData(
        ["posts", variables.postId, "comments"],
        (old: any) => {
          if (!old) return [data];
          return old.map((c: any) =>
            c.id === context?.optimisticComment?.id ? data : c
          );
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["posts", variables.postId, "comments"]
      });
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
      // Find and update the comment in any post's comments
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
        if (!old) return old;

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
        if (!old) return old;

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

// Real-time subscription for posts
export const usePostsSubscription = (kind?: PostKind) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("posts-changes")
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
              author:users!posts_created_by_fkey(id, full_name, avatar_url)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullPost) {
            queryClient.setQueriesData(
              { queryKey: ["posts", kind] },
              (old: any) => {
                if (!old) return old;

                const firstPage = old.pages[0];
                const postExists = firstPage.posts.some(
                  (p: Post) => p.id === fullPost.id
                );

                if (postExists) return old;

                return {
                  ...old,
                  pages: [
                    {
                      posts: [fullPost, ...firstPage.posts],
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
          const { data: fullPost } = await supabase
            .from("posts")
            .select(
              `
              *,
              author:users!posts_created_by_fkey(id, full_name, avatar_url)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullPost) {
            queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
              if (!old) return old;

              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  posts: page.posts.map((p: Post) =>
                    p.id === fullPost.id ? fullPost : p
                  )
                }))
              };
            });

            queryClient.setQueryData(["posts", fullPost.id], fullPost);
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
            if (!old) return old;

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
