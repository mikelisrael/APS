"use client";

import Spinner from "@/components/shared/spinner";
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useDeletePost,
  useInfinitePosts,
  usePostsSubscription
} from "@/hooks/use-posts";
import { Post } from "@/services/posts.service";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  useInView
} from "framer-motion";
import { useEffect, useRef } from "react";
import PostCard from "./post-card";
import emptyAnimation from "@/public/animations/empty ghost.json";
import Lottie from "lottie-react";

const Feed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error // Add this to see the actual error
  } = useInfinitePosts();

  const { mutate: deletePost } = useDeletePost();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef);

  usePostsSubscription();

  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Log the error for debugging
  useEffect(() => {
    if (error) {
      console.error("Feed error:", error);
    }
  }, [error]);

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  if (isLoading) {
    return (
      <section className="flex-center mt-5 min-h-[400px] border-t">
        <LoaderSpinner />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex-center mt-5 min-h-[400px] border-t">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load posts
          </p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page
          </p>
          {/* Show error details in development */}
          {process.env.NODE_ENV === "development" && error && (
            <details className="mx-auto mt-4 max-w-md text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </section>
    );
  }

  const posts = data?.posts || [];

  if (posts.length === 0) {
    return (
      <section className="flex-col-center mt-5 min-h-[400px] border-t">
        <Lottie
          animationData={emptyAnimation}
          loop
          autoplay
          style={{ width: 250, height: 250 }}
        />
        
        <div className="text-center">
          <p className="text-lg font-semibold">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to share something!
          </p>
        </div>
      </section>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="mt-5 grid gap-5 border-t border-border pt-5 ~px-2/7">
        <AnimatePresence mode="sync">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
        </AnimatePresence>

        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage && <Spinner size={32} />}
          {!hasNextPage && posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              You&apos;ve reached the end
            </p>
          )}
        </div>
      </section>
    </LazyMotion>
  );
};

export default Feed;
