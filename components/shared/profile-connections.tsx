"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useUserConnectionCount,
  useUserConnections
} from "@/hooks/use-user-connections";
import { Connection } from "@/types/connection";
import { useRouter } from "next/navigation";
import { IoPeopleOutline } from "react-icons/io5";

// todo: open a dialog to show all connections

interface ProfileConnectionsProps {
  userId: string;
}

const ProfileConnections = ({ userId }: ProfileConnectionsProps) => {
  const router = useRouter();
  const { data, isLoading } = useUserConnections(userId, 4);
  const { data: totalCount } = useUserConnectionCount(userId);

  const connections = data?.connections || [];

  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <h2 className="font-semibold">Network</h2>
      </CardHeader>
      {isLoading ? (
        <CardContent>
          <LoaderSpinner text="Loading connections..." />
        </CardContent>
      ) : (
        <CardContent>
          {connections.length > 0 ? (
            <div className="flex-center w-max gap-3">
              <div className="flex -space-x-4">
                {connections.slice(0, 4).map((conn: Connection) => (
                  <UserAvatar
                    key={conn.user.id}
                    src={conn.user.avatar_url}
                    fallback={
                      conn.user.full_name
                        ?.split(" ")
                        .map((name: string) => name[0])
                        .join("") || "U"
                    }
                    className="size-14 cursor-pointer border-2 border-background shadow-md"
                    onClick={() => router.push(`/${conn.user.username}`)}
                  />
                ))}
              </div>
              {totalCount > 4 && (
                <div className="rounded-full bg-muted p-2 text-sm font-medium">
                  +{totalCount - 4}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No connections yet</p>
          )}

          <Button variant="secondary" className="mt-5 w-full gap-2">
            <IoPeopleOutline size={20} />
            View Connections
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default ProfileConnections;
