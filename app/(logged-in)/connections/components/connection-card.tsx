"use client";

import Alumnus from "@/components/shared/alumnus-tag";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/types/models";
import { Check, SendHorizontal, X } from "lucide-react";
import Link from "next/link";

interface ConnectionCardProps {
  user: UserProfile;
  type: "pending" | "suggestion";
  connectionId?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onConnect?: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isConnecting?: boolean;
}

export const ConnectionCard = ({
  user,
  type,
  connectionId,
  onAccept,
  onReject,
  onConnect,
  isAccepting = false,
  isRejecting = false,
  isConnecting = false
}: ConnectionCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex gap-4 py-6">
        <UserAvatar
          className="size-14"
          src={user.avatar_url}
          alt={`${user.first_name} ${user.last_name}`}
        />
        <div className="flex-1">
          <Link href={`/${user.username}`} className="hover:underline">
            <h2 className="font-medium">{user.full_name}</h2>
          </Link>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="line-clamp-1 break-all text-muted-foreground">
              @{user.username}
            </span>
            {user.status === "alumnus" && <Alumnus />}
          </div>
          <div className="mt-2 flex" onClick={(e) => e.stopPropagation()}>
            {type === "pending" ? (
              <>
                <Button
                  className="px-0 text-xs"
                  variant="link"
                  size="sm"
                  onClick={onAccept}
                  disabled={isAccepting || isRejecting}
                >
                  <Check className="mr-1 size-4" />
                  {isAccepting ? "Accepting..." : "Accept"}
                </Button>
                <Button
                  className="text-xs text-red-500 dark:text-red-600"
                  variant="link"
                  size="sm"
                  onClick={onReject}
                  disabled={isAccepting || isRejecting}
                >
                  <X className="mr-1 size-4" />
                  {isRejecting ? "Rejecting..." : "Reject"}
                </Button>
              </>
            ) : (
              <Button
                className="px-0 text-xs"
                variant="link"
                size="sm"
                onClick={onConnect}
                disabled={isConnecting}
              >
                <SendHorizontal className="mr-1 size-4" />
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;
