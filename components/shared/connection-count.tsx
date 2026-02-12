import {useUserConnectionCount} from '@/hooks/use-user-connections';
import {IoPeopleOutline} from 'react-icons/io5';

const ConnectionCount = ({ userId }: { userId: string }) => {
  const { data: count, isLoading } = useUserConnectionCount(userId);

  return (
    <div className="flex-center gap-2 ~text-xs/sm sm:w-max">
      <IoPeopleOutline size={20} />
      {isLoading ? "..." : count} Connection{(!count || count > 1) && "s"}
    </div>
  );
};

export default ConnectionCount;