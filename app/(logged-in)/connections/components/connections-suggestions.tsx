import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useConnectionSuggestions,
  useSendConnectionRequest
} from "@/hooks/use-connections";
import emptyAnimation from "@/public/animations/empty ghost.json";
import { UserProfile } from "@/types/models";
import Lottie from "lottie-react";
import { ListFilter } from "lucide-react";
import { useState } from "react";
import { ConnectionCard } from "./connection-card";

type StatusFilter = "all" | "undergraduate" | "alumnus";

const ConnectionsSuggestions = () => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const { data: suggestions = [], isLoading } = useConnectionSuggestions(
    filter === "all" ? undefined : filter
  );
  const sendRequestMutation = useSendConnectionRequest();

  const handleConnect = (userId: string) => {
    sendRequestMutation.mutate(userId);
  };

  if (isLoading) {
    return <LoaderSpinner text="Loading Suggestions..." className="py-10" />;
  }

  return (
    <>
      <section className="flex-between sticky top-0 bg-background py-5 dark:bg-[#121212]">
        <h2>Suggestions ({suggestions.length})</h2>

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

      {suggestions.length === 0 ? (
        <div className="flex-col-center gap-1 py-10 text-center text-muted-foreground">
          <Lottie
            animationData={emptyAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 250, height: 250 }}
          />
          No suggestions available
        </div>
      ) : (
        <div className="grid ~gap-3/5 md:grid-cols-2">
          {suggestions.map((user: UserProfile) => (
            <ConnectionCard
              key={user.id}
              user={user}
              type="suggestion"
              onConnect={() => handleConnect(user.id)}
              isConnecting={sendRequestMutation.isPending}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ConnectionsSuggestions;
