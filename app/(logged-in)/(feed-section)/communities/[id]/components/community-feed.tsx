"use client";

import PostCard from "@/app/(logged-in)/_components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityPosts } from "@/hooks/use-communities";
import emptyAnimation from "@/public/animations/emptyBusiness.json";
import Lottie from "lottie-react";
import { useDeletePost } from "@/hooks/use-posts";
import { AnimatePresence, LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface CommunityFeedProps {
  communityId: string;
  isMember: boolean;
}

const CommunityFeed = ({ communityId, isMember }: CommunityFeedProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useCommunityPosts(communityId);

  const { mutate: deletePost } = useDeletePost();

  // Infinite scroll
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.posts || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-center min-h-[200px]">
        <p className="text-destructive">Failed to load posts</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="flex-center flex-col gap-3 px-5 py-10">
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          autoplay={true}
          style={{ width: 300, height: 300 }}
        />
        <div className="flex-col-center -mt-12 max-w-md gap-1 text-balance text-center">
          <h2 className="text-center text-2xl">No posts yet</h2>
          <p className="text-muted-foreground">
            {isMember
              ? "Be the first to create a post in this community!"
              : "Join this community to see and create posts"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-5">
        <AnimatePresence mode="sync">
          {posts.map((post) => (
            <m.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
            >
              <PostCard post={post} onDelete={deletePost} />
            </m.div>
          ))}
        </AnimatePresence>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage && (
            <div className="w-full space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          )}
          {!hasNextPage && posts.length > 0 && (
            <p className="text-sm text-muted-foreground">{`You've`} reached the end</p>
          )}
        </div>
      </div>
    </LazyMotion>
  );
};

export default CommunityFeed;
