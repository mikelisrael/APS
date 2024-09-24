import React from "react";
import suggestedUsers from "./data.json";
import Search from "./search";
import SuggestedUser from "./suggested-user";
import TrendingTopics from "./trending-topics";
import { Button } from "../ui/button";

const footerItems = [
  "About",
  "Help",
  "Press",
  "API",
  "Jobs",
  "Privacy",
  "Terms",
  "Locations",
  "Language",
];

const Extras = () => {
  return (
    <aside className="hidden space-y-5 border-l py-11 pl-5 lg:block">
      <Search />

      <section className="space-y-2 rounded-lg border p-2">
        <h2 className="font-semibold tracking-tighter ~text-base/lg">
          You might like
        </h2>
        <ul className="space-y-3">
          {suggestedUsers.map((user) => (
            <SuggestedUser key={user.username} user={user} />
          ))}
        </ul>
        <Button variant="link" className="px-0">
          See More
        </Button>
      </section>

      <section className="space-y-2 rounded-lg border p-2">
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
