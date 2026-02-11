import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications
} from "@/services/notifications.service";
import { toast } from "sonner";

export const useNotifications = (page: number = 0) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotifications(page)
  });

  // Real-time subscription
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = subscribeToNotifications(user.id, (notification) => {
        // Invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: ["notifications"] });

        // Show toast
        toast.info(notification.title, {
          description: notification.message
        });
      });

      return () => {
        channel.unsubscribe();
      };
    };

    fetchUser();
  }, [queryClient, supabase]);

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate
  };
};
