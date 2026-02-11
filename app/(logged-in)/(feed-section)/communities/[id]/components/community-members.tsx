"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityMembers } from "@/hooks/use-communities";
import emptyAnimation from "@/public/animations/emptyBusiness.json";
import Lottie from "lottie-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface CommunityMembersProps {
  communityId: string;
}

const CommunityMembers = ({ communityId }: CommunityMembersProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useCommunityMembers(communityId);

  // Infinite scroll
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const members = data?.members || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-center min-h-[200px]">
        <p className="text-destructive">Failed to load members</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <section className="flex-center flex-col gap-3 px-5 py-10">
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          autoplay={true}
          style={{ width: 300, height: 300 }}
        />
        <div className="flex-col-center -mt-12 max-w-md gap-1 text-balance text-center">
          <h2 className="text-center text-2xl">No members yet</h2>
          <p className="text-muted-foreground">
            Be the first to join this community!
          </p>
        </div>
      </section>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <Link
          key={member.id}
          href={`/${member.user?.username}`}
          className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <UserAvatar
            src={member.user?.avatar_url}
            fallback={getInitials(member.user?.full_name || "U")}
            className="h-12 w-12"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{member.user?.full_name}</p>
              <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                {member.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              @{member.user?.username}
            </p>
            <p className="text-xs text-muted-foreground">
              Joined {formatRelativeTime(member.joined_at)}
            </p>
          </div>
        </Link>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="w-full space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}
        {!hasNextPage && members.length > 0 && (
          <p className="text-sm text-muted-foreground">You've reached the end</p>
        )}
      </div>
    </div>
  );
};

export default CommunityMembers;
