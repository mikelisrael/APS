import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useAcceptConnectionRequest,
  useRejectConnectionRequest
} from "@/hooks/use-connections";
import { Connection } from "@/types/connection";
import { ListFilter } from "lucide-react";
import { useState } from "react";
import { ConnectionCard } from "./connection-card";

interface ConnectionsPendingProps {
  connections: Connection[];
  loading?: boolean;
}

type StatusFilter = "all" | "undergraduate" | "alumnus";

const ConnectionsPending = ({
  connections,
  loading
}: ConnectionsPendingProps) => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const acceptMutation = useAcceptConnectionRequest();
  const rejectMutation = useRejectConnectionRequest();

  const filteredConnections =
    filter === "all"
      ? connections
      : connections.filter((conn) => conn.user.status === filter);

  const handleAccept = (connectionId: string) => {
    acceptMutation.mutate(connectionId);
  };

  const handleReject = (connectionId: string) => {
    rejectMutation.mutate(connectionId);
  };

  if (loading) {
    return (
      <LoaderSpinner text="Loading Pending Requests..." className="py-10" />
    );
  }

  return (
    <>
      <section className="flex-between sticky top-0 bg-background py-5 dark:bg-[#121212]">
        <h2>Pending Requests ({connections.length})</h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ListFilter className="mr-2 h-4 w-4" />
              <span className="capitalize">
                {filter === "all" ? "All" : filter}
              </span>
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

      {filteredConnections.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          {connections.length === 0
            ? "No pending connection requests"
            : "No requests matching the selected filter"}
        </div>
      ) : (
        <div className="grid ~gap-3/5 md:grid-cols-2">
          {filteredConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              user={connection.user}
              type="pending"
              connectionId={connection.id}
              onAccept={() => handleAccept(connection.id)}
              onReject={() => handleReject(connection.id)}
              isAccepting={acceptMutation.isPending}
              isRejecting={rejectMutation.isPending}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ConnectionsPending;
