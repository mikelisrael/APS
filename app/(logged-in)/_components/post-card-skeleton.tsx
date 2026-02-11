import { Skeleton } from "@/components/ui/skeleton";

export const PostCardSkeleton = () => {
  return (
    <article className="grid grid-cols-[auto,1fr] gap-2 rounded-lg border bg-card px-5 pt-5">
      {/* Avatar */}
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

      {/* Content */}
      <section className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-5">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Post content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Image placeholder (optional - show sometimes) */}
        {Math.random() > 0.5 && <Skeleton className="h-64 w-full rounded-md" />}

        {/* Footer interactions */}
        <div className="flex items-center gap-6 py-5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </section>
    </article>
  );
};

export const PostCardSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};
