"use client";

import Alumnus from "@/components/shared/alumnus-tag";
import TransitionLink from "@/components/shared/transition-link";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useSendConnectionRequest } from "@/hooks/use-connections";
import { getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types/models";
import { LoaderCircle } from "lucide-react";

interface SuggestedUserProps {
  user: UserProfile;
}

const SuggestedUser: React.FC<SuggestedUserProps> = ({ user }) => {
  const sendRequestMutation = useSendConnectionRequest();

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendRequestMutation.mutate(user.id);
  };

  const isAlumnus = user.status === "alumnus";

  return (
    <li className="flex-center gap-2">
      <UserAvatar
        src={user.avatar_url}
        alt={user.full_name}
        fallback={getInitials(user.full_name)}
      />

      <TransitionLink href={`/${user.username}`} className="flex-1 text-left">
        <h3 className="line-clamp-1 break-all text-sm font-semibold tracking-tight">
          {user.full_name}
        </h3>

        <div className="flex -translate-y-0.5 items-center gap-1 text-xs">
          <span className="line-clamp-1 break-all text-muted-foreground">
            @{user.username}
          </span>

          {isAlumnus && <Alumnus showCircle />}
        </div>
      </TransitionLink>

      <Button
        variant="link"
        className="text-xs font-normal"
        onClick={handleConnect}
        disabled={sendRequestMutation.isPending}
      >
        {sendRequestMutation.isSuccess ? (
          "Requested"
        ) : sendRequestMutation.isPending ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          "Connect"
        )}
      </Button>
    </li>
  );
};

export default SuggestedUser;
