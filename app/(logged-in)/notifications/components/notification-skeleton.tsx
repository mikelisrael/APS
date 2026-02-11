import { Skeleton } from "@/components/ui/skeleton";

export const NotificationSkeleton = () => {
  return (
    <li className="flex gap-5 px-5 py-4">
      {/* Icon skeleton */}
      <Skeleton className="size-12 shrink-0 rounded-full" />

      {/* Content skeleton */}
      <div className="flex-grow space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Unread indicator skeleton */}
      <Skeleton className="size-2 shrink-0 rounded-full" />
    </li>
  );
};

export const NotificationSkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <ul className="mt-8 divide-y">
      {Array.from({ length: count }).map((_, index) => (
        <NotificationSkeleton key={index} />
      ))}
    </ul>
  );
};
