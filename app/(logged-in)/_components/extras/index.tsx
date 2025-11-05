import React from "react";
import { Button } from "../../../../components/ui/button";
import suggestedUsers from "./data.json";
import Search from "./search";
import SuggestedUser from "./suggested-user";
import TrendingTopics from "./trending-topics";
import Link from "next/link";

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

const Extras = () => {
  return (
    <aside className="safe-area hidden space-y-5 border-l pl-5 lg:block">
      <Search />

      <section className="space-y-2 rounded-lg border bg-card p-2">
        <h2 className="font-semibold tracking-tighter ~text-base/lg">
          You might like
        </h2>
        <ul className="space-y-3">
          {suggestedUsers.map((user) => (
            <SuggestedUser key={user.username} user={user} />
          ))}
        </ul>
        <Button variant="link" className="px-0" asChild>
          <Link href="/connections?tab=suggestions">See More</Link>
        </Button>
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
