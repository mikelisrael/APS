import { Skeleton } from "@/components/ui/skeleton";

export const PostDetailSkeleton = () => {
  return (
    <div className="mx-auto max-w-3xl ~px-2/7">
      {/* Header with Back Button */}
      <div className="mb-5 flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Post Content */}
      <article className="rounded-t-lg border-x border-t bg-card px-6 pt-6">
        <div className="grid grid-cols-[auto,1fr] gap-3">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full" />

          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Image placeholder */}
            <Skeleton className="h-96 w-full rounded-lg" />

            {/* Interaction Stats */}
            <div className="flex items-center gap-6 py-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </article>

      {/* Comment Input */}
      <div className="rounded-b-lg border bg-card px-6 py-3">
        <Skeleton className="h-20 w-full rounded-md" />
      </div>

      {/* Comments Section */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-6 w-32" />

        {/* Comment skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
