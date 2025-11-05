"use client";

import Alumnus from "@/components/shared/alumnus-tag";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useGetOrCreateChat } from "@/hooks/use-chats";
import { useRemoveConnection } from "@/hooks/use-connections";
import { useDebounce } from "@/hooks/use-debounce";
import { filterConnections } from "@/lib/search-connections";
import emptyAnimation from "@/public/animations/empty ghost.json";
import { Chat } from "@/services/chats.service";
import { Connection } from "@/types/connection";
import Lottie from "lottie-react";
import {
  ListFilter,
  LoaderCircle,
  MessageCircle,
  Search,
  UserRoundX
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface SingleConnectionProps {
  connection: Connection;
}

const SingleConnection = ({ connection }: SingleConnectionProps) => {
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const removeConnectionMutation = useRemoveConnection();

  const router = useRouter();
  const { mutate: handleStartChat, isPending: isCreatingChat } =
    useGetOrCreateChat({
      onSuccess: (chat: Chat) => {
        router.push(`/chat/${chat.id}`);
      }
    });

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
        <div className="flex-center">
          <Button
            variant="link"
            className="text-xs"
            size="sm"
            onClick={() => handleStartChat(connection.user.id)}
            disabled={isCreatingChat}
          >
            {isCreatingChat ? (
              <LoaderCircle size={20} className="mr-2 size-4 animate-spin" />
            ) : (
              <MessageCircle className="mr-1 size-4" />
            )}
            Message
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
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const filteredConnections = useMemo(() => {
    return filterConnections(connections, debouncedQuery, filter);
  }, [connections, debouncedQuery, filter]);

  if (loading) {
    return <LoaderSpinner text="Loading connections..." className="py-10" />;
  }

  return (
    <>
      <section className="flex-between sticky top-0 bg-background py-5 dark:bg-[#121212]">
        <h2>Your Connections ({connections.length})</h2>

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            className="grow bg-card text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        </div>
      </section>

      <Card>
        <CardContent className="pt-6">
          {filteredConnections.length === 0 ? (
            <div className="flex-col-center gap-1 py-10 text-center text-muted-foreground duration-300 animate-in fade-in">
              <Lottie
                animationData={emptyAnimation}
                loop
                autoplay
                style={{ width: 250, height: 250 }}
              />
              {connections.length === 0
                ? "No connections yet"
                : "No connections matching the selected filter/search"}
            </div>
          ) : (
            <ul className="divide-y duration-300 animate-in fade-in">
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
