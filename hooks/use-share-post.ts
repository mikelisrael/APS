import { sharePost } from "@/services/posts.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSharePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await sharePost(postId);
    },
    onSuccess: (_, postId) => {
      // Invalidate queries to refetch updated share counts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    }
  });
};
