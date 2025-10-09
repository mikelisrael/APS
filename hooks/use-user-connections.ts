import { useGetResource } from "@/hooks/use-query-resource";
import {
  getMutualConnectionCount,
  getUserConnectionCount,
  getUserConnections
} from "@/services/user-connections.service";
import { toast } from "sonner";

/**
 * Hook for fetching and paginating through a user's connections
 * @param userId - The ID of the user whose connections to fetch
 * @param pageSize - Number of items per page
 */
export const useUserConnections = (userId: string, pageSize = 10) => {
  return useGetResource({
    key: ["user", userId, "connections"],
    fn: () => getUserConnections(userId, 1, pageSize),
    select: (data) => ({
      connections: data.connections,
      totalCount: data.total,
      hasMore: data.hasMore
    }),
    enabled: !!userId,
    onError: (error) => {
      toast.error(error.message || "Failed to load connections");
    }
  });
};

/**
 * Hook for fetching just the connection count for a user
 * Useful when you only need the count without the full connection list
 */
export const useUserConnectionCount = (userId: string) => {
  return useGetResource({
    key: ["user", userId, "connectionCount"],
    fn: () => getUserConnectionCount(userId),
    enabled: !!userId,
    onError: (error) => {
      console.error("Error fetching connection count:", error);
      return 0;
    }
  });
};

/**
 * Hook for fetching the number of mutual connections between two users
 * @param userAId - First user's ID
 * @param userBId - Second user's ID
 */
export const useMutualConnectionCount = (userAId: string, userBId: string) => {
  return useGetResource({
    key: ["mutualConnections", userAId, userBId],
    fn: () => getMutualConnectionCount(userAId, userBId),
    enabled: !!(userAId && userBId),
    onError: (error) => {
      console.error("Error fetching mutual connections:", error);
      return 0;
    }
  });
};
