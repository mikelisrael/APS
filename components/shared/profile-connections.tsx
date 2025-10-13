"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useAuth } from "@/hooks/use-query-resource";
import {
  useUserConnectionCount,
  useUserConnections
} from "@/hooks/use-user-connections";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoPeopleOutline } from "react-icons/io5";
import ConnectionsView from "./connections-view";

interface ProfileConnectionsProps {
  userId: string;
}

const ProfileConnections = ({ userId }: ProfileConnectionsProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const { data, isLoading } = useUserConnections(userId, 4);
  const { data: totalCount } = useUserConnectionCount(userId);

  const connections = data?.connections || [];

  return (
    <>
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
            {!!connections.length ? (
              <>
                <div className="flex-center w-max gap-3">
                  <div className="flex -space-x-4">
                    {connections.slice(0, 4).map((conn: any) => (
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

                <Button
                  variant="secondary"
                  className="mt-5 w-full gap-2"
                  onClick={() => setOpenDialog(true)}
                >
                  <IoPeopleOutline size={20} />
                  View Connections
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <IoPeopleOutline
                    size={20}
                    className="text-muted-foreground"
                  />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground">
                  No connections yet
                </p>
                <p className="max-w-[220px] text-center text-xs text-muted-foreground">
                  This user hasn&apos;t connected with anyone yet
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <ResponsiveDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Connections"
        noSubmitButton
        className="max-w-xl"
      >
        <ConnectionsView userId={userId} currentUserId={user?.id || ""} />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileConnections;
