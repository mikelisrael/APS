import Alumnus from "@/components/shared/alumnus-tag";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useRemoveConnection } from "@/hooks/use-connections";
import { Connection } from "@/types/connection";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ListFilter, MessageCircle, UserRoundX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SingleConnectionProps {
  connection: Connection;
}

const SingleConnection = ({ connection }: SingleConnectionProps) => {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const removeConnectionMutation = useRemoveConnection();

  const handleRemove = () => {
    removeConnectionMutation.mutate(connection.id, {
      onSuccess: () => {
        setOpenRemoveDialog(false);
      }
    });
  };

  return (
    <>
      <li className="flex items-center gap-3 py-3">
        <UserAvatar
          className="size-14"
          src={connection.user.avatar_url}
          alt={`${connection.user.first_name} ${connection.user.last_name}`}
        />
        <div className="grow">
          <h2 className="font-medium">{connection.user.full_name}</h2>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span className="line-clamp-1 break-all text-muted-foreground">
              @{connection.user.username}
            </span>
            {connection.user.status === "alumnus" && <Alumnus />}
          </div>
        </div>
        <div className="flex-center">
          <Button variant="link" className="text-xs" size="sm" asChild>
            <Link href={`/chat/${connection.user.username}`}>
              <MessageCircle className="mr-1 size-4" />
              Message
            </Link>
          </Button>
          <Button
            className="text-xs text-red-500 dark:text-red-600"
            variant="link"
            size="sm"
            onClick={() => setOpenRemoveDialog(true)}
            disabled={removeConnectionMutation.isPending}
          >
            <UserRoundX className="mr-1 size-4" />
            {removeConnectionMutation.isPending ? "Removing..." : "Remove"}
          </Button>
        </div>
      </li>

      <ResponsiveDialog
        open={openRemoveDialog}
        onOpenChange={setOpenRemoveDialog}
        title="Remove Connection"
        submitButtonText="Remove"
        submitButtonVariant="destructive"
        onSubmit={handleRemove}
        loading={removeConnectionMutation.isPending}
        className="max-w-sm"
      >
        Are you sure you want to remove
        <span className="font-semibold"> {connection.user.full_name} </span>
        from your connections?
      </ResponsiveDialog>
    </>
  );
};

interface ConnectionListV2Props {
  connections: Connection[];
  loading?: boolean;
}

type StatusFilter = "all" | "undergraduate" | "alumnus";

const ConnectionListV2 = ({ connections, loading }: ConnectionListV2Props) => {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filteredConnections =
    filter === "all"
      ? connections
      : connections.filter((conn) => conn.user.status === filter);

  if (loading) {
    return <LoaderSpinner text="Loading connections..." className="py-10" />;
  }

  return (
    <>
      <section className="flex-between sticky top-0 bg-background py-5 dark:bg-[#121212]">
        <h2>Your Connections ({connections.length})</h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ListFilter className="mr-2 h-4 w-4" />
              {filter === "all" ? "All" : filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("alumnus")}>
              Alumnus
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("undergraduate")}>
              Undergraduate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <Card>
        <CardContent className="pt-6">
          {filteredConnections.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {connections.length === 0
                ? "No connections yet"
                : "No connections matching the selected filter"}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredConnections.map((connection) => (
                <SingleConnection key={connection.id} connection={connection} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ConnectionListV2;
