import Alumnus from "@/components/shared/alumnus-tag";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useGetOrCreateChat } from "@/hooks/use-chats";
import { Chat } from "@/services/chats.service";
import { Connection } from "@/types/connection";
import { LoaderCircle, MessageCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { IoPeopleOutline } from "react-icons/io5";

interface NewConversationDialogProps {
  isLoadingConnections: boolean;
  connectionSearch: string;
  setConnectionSearch: (value: string) => void;
  debouncedConnectionSearch: string;
  connections: Connection[];
  openNewChat: boolean;
  setOpenNewChat: (value: boolean) => void;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  isLoadingConnections,
  connectionSearch,
  setConnectionSearch,
  debouncedConnectionSearch,
  connections,
  openNewChat,
  setOpenNewChat
}) => {
  const router = useRouter();

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    if (!debouncedConnectionSearch) return connections;

    const query = debouncedConnectionSearch.toLowerCase();
    return connections.filter((conn: Connection) => {
      const name = conn.user?.full_name?.toLowerCase() || "";
      const username = conn.user?.username?.toLowerCase() || "";

      return name.includes(query) || username.includes(query);
    });
  }, [connections, debouncedConnectionSearch]);

  const { mutate: handleStartChat, isPending: isCreatingChat } =
    useGetOrCreateChat({
      onSuccess: (chat: Chat) => {
        setOpenNewChat(false);
        setConnectionSearch("");
        router.push(`/chat/${chat.id}`);
      }
    });

  return (
    <ResponsiveDialog
      open={openNewChat}
      onOpenChange={setOpenNewChat}
      title="Start a Conversation"
      noSubmitButton
      className="max-w-xl"
    >
      <div className="relative space-y-4">
        {isCreatingChat && (
          <div className="flex-center absolute inset-0 z-30 bg-background/20 backdrop-blur-[2px]">
            <LoaderCircle size={30} className="animate-spin" />
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            className="grow bg-card text-sm focus:outline-none"
            value={connectionSearch}
            onChange={(e) => setConnectionSearch(e.target.value)}
          />
        </div>

        {isLoadingConnections ? (
          <LoaderSpinner text="Loading connections..." className="py-10" />
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <IoPeopleOutline size={20} className="text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              {debouncedConnectionSearch
                ? "No connections found"
                : "No connections yet"}
            </p>
            <p className="max-w-[220px] text-center text-xs text-muted-foreground">
              {debouncedConnectionSearch
                ? "Try searching with a different name"
                : "Connect with others to start conversations"}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConnections.map((connection: Connection) => {
              const otherUserId = connection.user?.id;

              return (
                <li
                  key={connection.id}
                  className="flex items-center gap-3 py-3"
                >
                  <UserAvatar
                    className="size-14"
                    src={connection.user?.avatar_url}
                    fallback={
                      connection.user?.full_name
                        ?.split(" ")
                        .map((name: string) => name[0])
                        .join("") || "U"
                    }
                  />

                  <div className="grow">
                    <p className="font-medium">{connection.user?.full_name}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <span className="line-clamp-1 break-all text-muted-foreground">
                        @{connection.user?.username}
                      </span>
                      {connection.user?.status === "alumnus" && <Alumnus />}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartChat(otherUserId)}
                    disabled={isCreatingChat || !otherUserId}
                    className="text-primary"
                  >
                    <MessageCircle className="mr-1 size-4" />
                    Message
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ResponsiveDialog>
  );
};

export default NewConversationDialog;
