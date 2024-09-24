import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

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
      <Avatar>
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 text-left">
        <h3 className="line-clamp-1 text-sm font-semibold tracking-tight">
          {user.name}
        </h3>

        <div className="flex-center -translate-y-0.5 gap-1 text-xs">
          <span className="text-muted-foreground">
            @
            {user.username.length > 15
              ? `${user.username.substring(0, 11)}...`
              : user.username}
          </span>

          {user.graduate && (
            <>
              <span>•</span>

              <Badge variant="naked" className="font-medium">
                Alumnus
              </Badge>
            </>
          )}
        </div>
      </div>

      <Button variant="link" className="text-xs font-normal">
        Connect
      </Button>
    </li>
  );
};

export default SuggestedUser;
