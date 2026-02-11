import {
  useGetResource,
  useModifyResource,
  useAuth
} from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
  createCommunity,
  CreateCommunityData,
  deleteCommunity,
  getCommunities,
  getCommunity,
  getCommunityMembers,
  getCommunityPosts,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  UpdateCommunityData,
  Community
} from "@/services/communities.service";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

// Hook for infinite scroll communities
export const useInfiniteCommunities = (
  filter?: { search?: string; joined?: boolean },
  pageSize: number = 12
) => {
  return useInfiniteQuery({
    queryKey: ["communities", filter],
    queryFn: ({ pageParam = 0 }) => getCommunities(pageParam, pageSize, filter),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      communities: data.pages.flatMap((page) => page.communities)
    })
  });
};

// Hook for single community
export const useCommunity = (communityId: string) => {
  return useGetResource({
    key: ["communities", communityId],
    fn: () => getCommunity(communityId),
    enabled: !!communityId,
    onError: (error) => {
      toast.error(error.message || "Failed to load community");
    }
  });
};

// Hook for creating community
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["communities"],
    fn: (data: CreateCommunityData) => createCommunity(data),
    onSuccess: () => {
      toast.success("Community created successfully");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create community");
    }
  });
};

// Hook for updating community
export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["communities"],
    fn: ({
      communityId,
      data
    }: {
      communityId: string;
      data: UpdateCommunityData;
    }) => updateCommunity(communityId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["communities", variables.communityId], data);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast.success("Community updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update community");
    }
  });
};

// Hook for deleting community
export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["communities"],
    fn: (communityId: string) => deleteCommunity(communityId),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.removeQueries({ queryKey: ["communities", communityId] });
      toast.success("Community deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete community");
    }
  });
};

// Hook for joining community with optimistic update
export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["communities"],
    fn: (communityId: string) => joinCommunity(communityId),
    onMutate: async (communityId: string) => {
      await queryClient.cancelQueries({ queryKey: ["communities"] });

      const previousCommunities = queryClient.getQueriesData({
        queryKey: ["communities"]
      });
      const previousCommunity = queryClient.getQueryData([
        "communities",
        communityId
      ]);

      // Optimistic update - mark as joined
      queryClient.setQueriesData({ queryKey: ["communities"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            communities: page.communities.map((c: Community) =>
              c.id === communityId
                ? {
                    ...c,
                    is_member: true,
                    member_count: c.member_count + 1,
                    user_membership: {
                      role: "member" as const,
                      joined_at: new Date().toISOString()
                    },
                    _optimistic: true
                  }
                : c
            )
          }))
        };
      });

      queryClient.setQueryData(["communities", communityId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_member: true,
          member_count: old.member_count + 1,
          user_membership: {
            role: "member" as const,
            joined_at: new Date().toISOString()
          },
          _optimistic: true
        };
      });

      return { previousCommunities, previousCommunity, communityId };
    },
    onError: (error: any, communityId, context: any) => {
      // Rollback
      if (context?.previousCommunities) {
        context.previousCommunities.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          ["communities", communityId],
          context.previousCommunity
        );
      }
      toast.error(error.message || "Failed to join community");
    },
    onSuccess: (_, communityId) => {
      // Remove optimistic flag
      queryClient.setQueriesData({ queryKey: ["communities"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            communities: page.communities.map((c: Community & { _optimistic?: boolean }) => {
              if (c.id === communityId && c._optimistic) {
                const { _optimistic, ...rest } = c;
                return rest;
              }
              return c;
            })
          }))
        };
      });

      toast.success("Joined community successfully");
    }
  });
};

// Hook for leaving community with optimistic update
export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();

  return useModifyResource({
    key: ["communities"],
    fn: (communityId: string) => leaveCommunity(communityId),
    onMutate: async (communityId: string) => {
      await queryClient.cancelQueries({ queryKey: ["communities"] });

      const previousCommunities = queryClient.getQueriesData({
        queryKey: ["communities"]
      });
      const previousCommunity = queryClient.getQueryData([
        "communities",
        communityId
      ]);

      // Optimistic update - mark as left
      queryClient.setQueriesData({ queryKey: ["communities"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            communities: page.communities.map((c: Community) =>
              c.id === communityId
                ? {
                    ...c,
                    is_member: false,
                    member_count: Math.max(0, c.member_count - 1),
                    user_membership: null,
                    _optimistic: true
                  }
                : c
            )
          }))
        };
      });

      queryClient.setQueryData(["communities", communityId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_member: false,
          member_count: Math.max(0, old.member_count - 1),
          user_membership: null,
          _optimistic: true
        };
      });

      return { previousCommunities, previousCommunity, communityId };
    },
    onError: (error: any, communityId, context: any) => {
      // Rollback
      if (context?.previousCommunities) {
        context.previousCommunities.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          ["communities", communityId],
          context.previousCommunity
        );
      }
      toast.error(error.message || "Failed to leave community");
    },
    onSuccess: () => {
      toast.success("Left community successfully");
    }
  });
};

// Hook for community members
export const useCommunityMembers = (communityId: string) => {
  return useInfiniteQuery({
    queryKey: ["communities", communityId, "members"],
    queryFn: ({ pageParam = 0 }) => getCommunityMembers(communityId, pageParam, 20),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!communityId,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      members: data.pages.flatMap((page) => page.members)
    })
  });
};

// Hook for community posts
export const useCommunityPosts = (communityId: string) => {
  return useInfiniteQuery({
    queryKey: ["communities", communityId, "posts"],
    queryFn: ({ pageParam = 0 }) => getCommunityPosts(communityId, pageParam, 10),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!communityId,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      posts: data.pages.flatMap((page) => page.posts)
    })
  });
};

// Real-time subscription for communities
export const useCommunitiesSubscription = (filter?: { joined?: boolean }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("communities-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "communities"
        },
        async (payload) => {
          const { data: fullCommunity } = await supabase
            .from("communities")
            .select(
              `
                *,
                creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
              `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullCommunity) {
            queryClient.setQueriesData(
              { queryKey: ["communities", filter] },
              (old: any) => {
                if (!old?.pages?.[0]) return old;

                const firstPage = old.pages[0];
                const exists = firstPage.communities.some(
                  (c: Community) => c.id === fullCommunity.id
                );

                if (exists) return old;

                return {
                  ...old,
                  pages: [
                    {
                      communities: [
                        { ...fullCommunity, is_member: false, user_membership: null },
                        ...firstPage.communities
                      ],
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
          table: "communities"
        },
        async (payload) => {
          const { data: fullCommunity } = await supabase
            .from("communities")
            .select(
              `
                *,
                creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
              `
            )
            .eq("id", payload.new.id)
            .single();

          if (fullCommunity) {
            queryClient.setQueriesData({ queryKey: ["communities"] }, (old: any) => {
              if (!old?.pages) return old;

              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  communities: page.communities.map((c: Community) =>
                    c.id === fullCommunity.id ? { ...c, ...fullCommunity } : c
                  )
                }))
              };
            });

            queryClient.setQueryData(
              ["communities", fullCommunity.id],
              (old: any) => {
                if (!old) return fullCommunity;
                return { ...old, ...fullCommunity };
              }
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "communities"
        },
        (payload) => {
          queryClient.setQueriesData({ queryKey: ["communities"] }, (old: any) => {
            if (!old?.pages) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                communities: page.communities.filter(
                  (c: Community) => c.id !== payload.old.id
                )
              }))
            };
          });

          queryClient.removeQueries({
            queryKey: ["communities", payload.old.id]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, filter?.joined]);
};
