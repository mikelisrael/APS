"use client";

import ImageLoader from "@/components/shared/image-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCommunitiesSubscription,
  useInfiniteCommunities,
  useJoinCommunity,
  useLeaveCommunity
} from "@/hooks/use-communities";
import emptyAnimation from "@/public/animations/emptyBusiness.json";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useInView
} from "framer-motion";
import Lottie from "lottie-react";
import { MessageSquare, Plus, Search, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CreateCommunityDialog from "./create-community-dialog";

const CommunitiesClient = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<{ search?: string; joined?: boolean }>(
    {}
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteCommunities(filter);

  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();

  // Real-time subscription
  useCommunitiesSubscription(filter);

  // Infinite scroll
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({ ...prev, search: searchQuery || undefined }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleJoin = (e: React.MouseEvent, communityId: string) => {
    e.stopPropagation();
    joinCommunity(communityId);
  };

  const handleLeave = (e: React.MouseEvent, communityId: string) => {
    e.stopPropagation();
    leaveCommunity(communityId);
  };

  const handleView = (communityId: string) => {
    router.push(`/communities/${communityId}`);
  };

  const communities = data?.communities || [];

  if (isLoading) {
    return (
      <main className="px-3 md:~px-2/5">
        <section className="flex-between mb-6">
          <h1 className="page-title !px-0">Communities</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </section>

        <section className="sticky top-0 z-10 flex items-stretch gap-4 bg-background pb-7 pt-4 dark:bg-[#121212]">
          <Skeleton className="h-10 flex-grow rounded-lg" />
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="!mt-5 grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
              <CardFooter className="gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="px-3 md:~px-2/5">
        <section className="flex-between mb-6">
          <h1 className="page-title !px-0">Communities</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </section>
        <div className="flex-center min-h-[400px]">
          <p className="text-destructive">Failed to load communities</p>
        </div>
      </main>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <main className="px-3 md:~px-2/5">
        <section className="flex-between mb-6">
          <h1 className="page-title !px-0">Communities</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </section>

        <section className="sticky top-0 z-10 flex items-stretch gap-4 bg-background pb-7 pt-4 dark:bg-[#121212]">
          <div className="flex flex-grow items-center gap-2 rounded-lg border bg-card px-4 py-2">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for communities"
              className="grow bg-card text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="sync">
            {communities.map((community) => (
              <m.div
                key={community.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => handleView(community.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <ImageLoader
                        src={
                          community.image_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(community.name)}&background=random`
                        }
                        alt={`${community.name} image`}
                        className="aspect-square w-10 rounded-md bg-muted object-cover"
                        showLoader={false}
                      />

                      <h2 className="text-base font-medium">
                        {community.name}
                      </h2>
                    </div>
                    <div className="!mt-5 grid grid-cols-2 text-muted-foreground">
                      <div className="flex items-center gap-2 text-xs">
                        <UsersRound size={20} /> {community.member_count}{" "}
                        Members
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MessageSquare size={20} /> {community.post_count} Posts
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {community.description || "No description"}
                    </p>
                  </CardContent>

                  <CardFooter className="gap-2">
                    {community.is_member ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={(e) => handleLeave(e, community.id)}
                          disabled={isLeaving}
                        >
                          {isLeaving ? "Leaving..." : "Leave"}
                        </Button>
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(community.id);
                          }}
                        >
                          View
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="w-full"
                          onClick={(e) => handleJoin(e, community.id)}
                          disabled={isJoining}
                        >
                          {isJoining ? "Joining..." : "Join"}
                        </Button>
                        <Button
                          variant="link"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(community.id);
                          }}
                        >
                          View
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </m.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage && (
            <div className="grid w-full gap-5 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!hasNextPage && communities.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {`You've `}reached the end
            </p>
          )}
        </div>

        {/* Empty state */}
        {communities.length === 0 && !isLoading && (
          <section className="flex-center flex-col gap-3 px-5 py-10">
            <Lottie
              animationData={emptyAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 300, height: 300 }}
            />
            <div className="flex-col-center -mt-12 max-w-md gap-1 text-balance text-center">
              <h2 className="text-center text-2xl">No communities found</h2>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to create a community!"}
              </p>
            </div>
          </section>
        )}

        {/* Create Community Dialog */}
        <CreateCommunityDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </main>
    </LazyMotion>
  );
};

export default CommunitiesClient;
