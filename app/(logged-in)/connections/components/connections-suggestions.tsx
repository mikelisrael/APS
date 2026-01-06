"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useConnectionSuggestions } from "@/hooks/use-connections";
import { useDebounce } from "@/hooks/use-debounce";
import { filterUsers } from "@/lib/search-connections";
import emptyAnimation from "@/public/animations/empty ghost.json";
import type { UserProfile } from "@/types/models";
import Lottie from "lottie-react";
import { ListFilter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ConnectionCard } from "./connection-card";

type StatusFilter = "all" | "undergraduate" | "alumnus";

/** Type guard: narrows Partial<UserProfile> to UserProfile when id exists (and is string) */
function isFullUser(
  u: Partial<UserProfile> | null | undefined
): u is UserProfile {
  return !!u && typeof u.id === "string";
}

const ConnectionsSuggestions = () => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: suggestions = [], isLoading } = useConnectionSuggestions();

  const filtered = useMemo(() => {
    return filterUsers(suggestions, debouncedQuery, filter);
  }, [suggestions, debouncedQuery, filter]);

  const safeSuggestions = useMemo(() => {
    return filtered.filter(isFullUser);
  }, [filtered]);

  if (isLoading) {
    return <LoaderSpinner text="Loading Suggestions..." className="py-10" />;
  }

  return (
    <>
      <section className="flex-between sticky top-0 z-10 bg-background py-5 dark:bg-[#121212]">
        <h2>Suggestions ({safeSuggestions.length})</h2>

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
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

      {safeSuggestions.length === 0 ? (
        <div className="flex-col-center gap-1 py-10 text-center text-muted-foreground duration-300 animate-in fade-in">
          <Lottie
            animationData={emptyAnimation}
            loop
            autoplay
            style={{ width: 250, height: 250 }}
          />
          No suggestions available
        </div>
      ) : (
        <div className="grid duration-300 ~gap-3/5 animate-in fade-in md:grid-cols-2">
          {safeSuggestions.map((user) => (
            <ConnectionCard key={user.id} user={user} type="suggestion" />
          ))}
        </div>
      )}
    </>
  );
};

export default ConnectionsSuggestions;
