import { useGetResource, useModifyResource } from "@/hooks/use-query-resource";
import { createClient } from "@/lib/supabase/client";
import {
  acceptConnectionRequest,
  getAcceptedConnections,
  getConnectionBetweenUsers,
  getConnectionSuggestions,
  getPendingRequests,
  rejectConnectionRequest,
  removeConnection,
  sendConnectionRequest
} from "@/services/connection.service";
import { toast } from "sonner";

// Hook for fetching accepted connections
export const useAcceptedConnections = () => {
  return useGetResource({
    key: ["connections", "accepted"],
    fn: () => getAcceptedConnections(),
    select: (data) => data || [],
    onError: (error) => {
      toast.error(error.message || "Failed to load connections");
    }
  });
};

// Hook for fetching pending requests
export const usePendingRequests = () => {
  return useGetResource({
    key: ["connections", "pending"],
    fn: () => getPendingRequests(),
    select: (data) => data || [],
    onError: (error) => {
      toast.error(error.message || "Failed to load pending requests");
    }
  });
};

// Hook for fetching connection suggestions
export const useConnectionSuggestions = (
  filter?: "undergraduate" | "alumnus"
) => {
  return useGetResource({
    key: ["connections", "suggestions", filter || "all"],
    fn: () => getConnectionSuggestions(filter),
    select: (data) => data || [],
    onError: (error) => {
      toast.error(error.message || "Failed to load suggestions");
    }
  });
};

// Hook for sending connection request
export const useSendConnectionRequest = () => {
  return useModifyResource({
    key: ["connections"],
    fn: (userId: string) => sendConnectionRequest(userId),
    onSuccess: () => {
      toast.success("Connection request sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send request");
    }
  });
};

// Hook for accepting connection request
export const useAcceptConnectionRequest = () => {
  return useModifyResource({
    key: ["connections"],
    fn: (connectionId: string) => acceptConnectionRequest(connectionId),
    onSuccess: () => {
      toast.success("Connection request accepted!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept request");
    }
  });
};

// Hook for rejecting connection request
export const useRejectConnectionRequest = () => {
  return useModifyResource({
    key: ["connections"],
    fn: (connectionId: string) => rejectConnectionRequest(connectionId),
    onSuccess: () => {
      toast.success("Connection request rejected");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject request");
    }
  });
};

// Hook for removing connection
export const useRemoveConnection = () => {
  return useModifyResource({
    key: ["connections"],
    fn: (connectionId: string) => removeConnection(connectionId),
    onSuccess: () => {
      toast.success("Connection removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove connection");
    }
  });
};

// Hook for checking connection status with a specific user
export const useConnectionStatus = (userId: string) => {
  const { data, isLoading } = useGetResource({
    key: ["connections", "status", userId],
    fn: async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return { connection: null, currentUserId: null };
      }

      const connection = await getConnectionBetweenUsers(
        currentUser.id,
        userId
      );

      return { connection, currentUserId: currentUser.id };
    },
    select: (data) => ({
      status: data?.connection?.status || null,
      connectionId: data?.connection?.id,
      isReceiver: data?.connection?.receiver_id === data?.currentUserId,
      isRequester: data?.connection?.requester_id === data?.currentUserId
    }),
    enabled: !!userId,
    onError: (error) => {
      console.error("Error fetching connection status:", error);
    }
  });

  const { mutate: sendConnectionRequest, isPending: isSending } =
    useSendConnectionRequest();

  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptConnectionRequest();

  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectConnectionRequest();

  const sendRequest = () => {
    if (!userId) return;
    sendConnectionRequest(userId);
  };

  const acceptConnectionRequest = () => {
    if (!data?.connectionId) return;
    acceptRequest(data.connectionId);
  };

  const rejectConnectionRequest = () => {
    if (!data?.connectionId) return;
    rejectRequest(data.connectionId);
  };

  return {
    status: data?.status || null,
    connectionId: data?.connectionId,
    isReceiver: data?.isReceiver || false,
    isRequester: data?.isRequester || false,
    isLoading: isLoading || isSending || isAccepting || isRejecting,
    sendRequest,
    acceptConnectionRequest,
    rejectConnectionRequest
  };
};
