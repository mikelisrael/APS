import {Skeleton} from '@/components/ui/skeleton';
const ChatSkeleton = () => (
  <li className="flex w-full items-center gap-3 px-2 py-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="grow space-y-2">
      <div className="flex-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  </li>
);

export default ChatSkeleton