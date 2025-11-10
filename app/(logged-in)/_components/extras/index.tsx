"use client";

import { LoaderSpinner } from "@/components/ui/loaders";
import { useConnectionSuggestions } from "@/hooks/use-connections";
import type { UserProfile } from "@/types/models";
import Link from "next/link";
import React from "react";
import { IoPeopleOutline } from "react-icons/io5";
import { Button } from "../../../../components/ui/button";
import Search from "./search";
import SuggestedUser from "./suggested-user";
import TrendingTopics from "./trending-topics";

const footerItems = [
  "About",
  "Help",
  "Press",
  "API",
  "Jobs",
  "Privacy",
  "Terms",
  "Locations",
  "Language"
];

/** Type guard to ensure we have complete user data */
function isFullUser(
  u: Partial<UserProfile> | null | undefined
): u is UserProfile {
  return !!u && typeof u.id === "string" && !!u.username && !!u.full_name;
}

const Extras = () => {
  const { data: suggestions = [], isLoading } = useConnectionSuggestions();
  const safeSuggestions = suggestions.filter(isFullUser).slice(0, 4);

  return (
    <aside className="safe-area hidden space-y-5 border-l pl-5 lg:block">
      <Search />

      <section className="space-y-2 rounded-lg border bg-card p-2">
        {isLoading ? (
          <div className="h-[200px] py-6">
            <LoaderSpinner text="Loading suggestions..." />
          </div>
        ) : safeSuggestions.length > 0 ? (
          <>
            <h2 className="font-semibold tracking-tighter ~text-base/lg">
              You might like
            </h2>

            <ul className="space-y-3">
              {safeSuggestions.map((user: UserProfile) => (
                <SuggestedUser key={user.id} user={user} />
              ))}
            </ul>
            <Button variant="link" className="px-0" asChild>
              <Link href="/connections?tab=suggestions">See More</Link>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <IoPeopleOutline size={20} className="text-muted-foreground" />
            </div>
            <p className="mb-1 text-center text-sm font-medium text-foreground">
              No suggestions available
            </p>
            <p className="max-w-[200px] text-center text-xs text-muted-foreground">
              Check back later for new connection suggestions
            </p>
          </div>
        )}
      </section>

      <section className="space-y-2 rounded-lg border bg-card p-2">
        <h2 className="font-semibold tracking-tighter ~text-base/lg">
          Trending today
        </h2>
        <TrendingTopics />
        <Button variant="link" className="px-0">
          See More
        </Button>
      </section>

      <footer className="flex-center flex-wrap gap-2 text-xs text-muted-foreground">
        {footerItems.map((item, index) => (
          <React.Fragment key={item}>
            <div>{item}</div>
            {index < footerItems.length - 1 && (
              <div className="h-[14px] w-[1px] bg-border" />
            )}
          </React.Fragment>
        ))}
      </footer>
    </aside>
  );
};

export default Extras;
