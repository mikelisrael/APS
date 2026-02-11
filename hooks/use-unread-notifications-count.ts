import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export const useUnreadNotificationsCount = () => {
  const supabase = createClient();

  const { data: count = 0, refetch } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      return count || 0;
    }
  });

  // Real-time subscription to update count
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("unread_notifications_count")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`
          },
          () => {
            refetch();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    fetchUser();
  }, [supabase, refetch]);

  return count;
};
