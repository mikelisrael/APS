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
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import PostCard from "./post-card";
import PostDetail from "./post-detail";

const Feed = () => {
  const searchParams = useSearchParams();
  const postId = searchParams.get("post");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
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

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  if (postId) {
    return <PostDetail postId={postId} />;
  }

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
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load posts
          </p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </section>
    );
  }

  const posts = data?.posts || [];

  if (posts.length === 0) {
    return (
      <section className="flex-center mt-5 min-h-[400px] border-t">
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
        <AnimatePresence mode="popLayout">
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
