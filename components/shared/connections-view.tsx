"use client";

import Alumnus from "@/components/shared/alumnus-tag";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useConnectionStatus } from "@/hooks/use-connections";
import { useUserConnections } from "@/hooks/use-user-connections";
import { Connection } from "@/types/connection";
import { MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";

interface ConnectionItemProps {
  connection: any;
  currentUserId: string;
}

const ConnectionItem = ({ connection, currentUserId }: ConnectionItemProps) => {
  const { status, isLoading, sendRequest } = useConnectionStatus(
    connection.user.id
  );

  const isMutualConnection = status === "accepted";
  const isPending = status === "pending";
  const isCurrentUser = connection.user.id === currentUserId;

  return (
    <li className="flex items-center gap-3 py-3">
      <Link href={`/${connection.user.username}`}>
        <UserAvatar
          className="size-14"
          src={connection.user.avatar_url}
          fallback={
            connection.user.full_name
              ?.split(" ")
              .map((name: string) => name[0])
              .join("") || "U"
          }
        />
      </Link>

      <div className="grow">
        <Link
          href={`/${connection.user.username}`}
          className="font-medium hover:underline"
        >
          {connection.user.full_name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <span className="line-clamp-1 break-all text-muted-foreground">
            @{connection.user.username}
          </span>
          {connection.user.status === "alumnus" && <Alumnus />}
        </div>
      </div>

      {!isCurrentUser && (
        <div className="flex-center">
          {isMutualConnection ? (
            <Button variant="link" className="text-xs" size="sm" asChild>
              <Link href={`/chat/${connection.user.username}`}>
                <MessageCircle className="mr-1 size-4" />
                Message
              </Link>
            </Button>
          ) : (
            <Button
              variant="link"
              className="text-xs"
              size="sm"
              onClick={sendRequest}
              disabled={isLoading || isPending}
            >
              <UserPlus className="mr-1 size-4" />
              {isPending ? "Pending" : "Connect"}
            </Button>
          )}
        </div>
      )}
    </li>
  );
};

interface ConnectionsViewProps {
  userId: string;
  currentUserId: string;
}

const ConnectionsView = ({ userId, currentUserId }: ConnectionsViewProps) => {
  const { data, isLoading } = useUserConnections(userId, 100);

  const connections = data?.connections || [];

  if (isLoading) {
    return <LoaderSpinner text="Loading connections..." className="py-10" />;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {connections.length}{" "}
        {connections.length === 1 ? "connection" : "connections"}
      </div>

      {connections.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No connections yet
        </div>
      ) : (
        <ul className="divide-y">
          {connections.map((connection: Connection, index: number) => (
            <ConnectionItem
              key={index}
              connection={connection}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConnectionsView;
