"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCommunity,
  useJoinCommunity,
  useLeaveCommunity,
  useDeleteCommunity
} from "@/hooks/use-communities";
import { Pencil, Settings, Trash2, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommunityFeed from "./community-feed";
import CommunityMembers from "./community-members";
import EditCommunityDialog from "./edit-community-dialog";
import PostComposer from "@/app/(logged-in)/_components/post-composer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CommunityDetailClientProps {
  communityId: string;
}

const CommunityDetailClient = ({ communityId }: CommunityDetailClientProps) => {
  const router = useRouter();
  const { data: community, isLoading, isError } = useCommunity(communityId);
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();
  const { mutate: deleteCommunity, isPending: isDeleting } = useDeleteCommunity();

  const [showPostComposer, setShowPostComposer] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = community?.user_membership?.role === "owner";
  const isModerator = community?.user_membership?.role === "moderator";
  const canModerate = isOwner || isModerator;

  const handleJoin = () => {
    joinCommunity(communityId);
  };

  const handleLeave = () => {
    leaveCommunity(communityId);
  };

  const handleDelete = () => {
    deleteCommunity(communityId, {
      onSuccess: () => {
        router.push("/communities");
      }
    });
  };

  if (isLoading) {
    return (
      <main className="~px-2/5">
        {/* Header Skeleton */}
        <section className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </section>

        {/* Tabs Skeleton */}
        <Skeleton className="mb-6 h-10 w-48" />

        {/* Content Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !community) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load community
          </p>
          <p className="text-sm text-muted-foreground">
            This community may not exist or you {`don't`} have access to it
          </p>
          <Button
            onClick={() => router.push("/communities")}
            className="mt-4"
            variant="outline"
          >
            Back to Communities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="~px-2/5">
      {/* Cover Image */}
      {community.cover_url && (
        <div className="relative -mx-2 mb-4 h-48 overflow-hidden rounded-t-lg md:-mx-5 md:h-64">
          <Image
            src={community.cover_url}
            alt={`${community.name} cover`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Community Header */}
      <section className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start">
        {/* Community Image */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-4 border-background">
          {community.image_url ? (
            <Image
              src={community.image_url}
              alt={community.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-2xl font-bold">
                {community.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Community Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{community.name}</h1>
              <p className="text-sm text-muted-foreground">
                {community.visibility === "private" ? "Private" : "Public"} Community
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {community.is_member ? (
                <>
                  <Button onClick={() => setShowPostComposer(true)} size="sm">
                    Create Post
                  </Button>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Community
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Community
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={isLeaving}
                    size="sm"
                  >
                    {isLeaving ? "Leaving..." : "Leave"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleJoin} disabled={isJoining} size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isJoining ? "Joining..." : "Join Community"}
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {community.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {community.member_count} {community.member_count === 1 ? "member" : "members"}
            </span>
            <span>•</span>
            <span>{community.post_count} {community.post_count === 1 ? "post" : "posts"}</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <CommunityFeed
            communityId={communityId}
            isMember={community.is_member || false}
          />
        </TabsContent>

        <TabsContent value="members">
          <CommunityMembers communityId={communityId} />
        </TabsContent>
      </Tabs>

      {/* Post Composer */}
      <PostComposer
        open={showPostComposer}
        onOpenChange={setShowPostComposer}
        communityId={communityId}
      />

      {/* Edit Community Dialog */}
      <EditCommunityDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        community={community}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{community.name}</strong>?
              This action cannot be undone. All posts and members will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default CommunityDetailClient;
