import Alumnus from "@/components/shared/alumnus-tag";
import TransitionLink from "@/components/shared/transition-link";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { IoPersonAddOutline } from "react-icons/io5";

interface SuggestedUserProps {
  user: {
    name: string;
    username: string;
    avatarUrl: string;
    graduate: boolean;
  };
}

const SuggestedUser: React.FC<SuggestedUserProps> = ({ user }) => {
  return (
    <li className="flex-center gap-2">
      <UserAvatar src={user.avatarUrl} alt={user.name} />

      <TransitionLink href={`/${user.username}`} className="flex-1 text-left">
        <h3 className="line-clamp-1 break-all text-sm font-semibold tracking-tight">
          {user.name}
        </h3>

        <div className="flex -translate-y-0.5 items-center gap-1 text-xs">
          <span className="line-clamp-1 break-all text-muted-foreground">
            @{user.username}
          </span>

          {user.graduate && <Alumnus />}
        </div>
      </TransitionLink>

      <Button variant="link" className="text-xs font-normal">
        <IoPersonAddOutline className="mr-1.5 size-4" />
        Connect
      </Button>
    </li>
  );
};

export default SuggestedUser;
