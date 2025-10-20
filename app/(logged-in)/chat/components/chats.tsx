"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import React from "react";

const SingleChat = () => {
  return (
    <li className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-3 hover:bg-accent">
      <UserAvatar
        src="https://assets.lummi.ai/assets/QmVnS1az2XRYsEc5QLP2U8g2sjVANiEzBs6t1Z4nUXLk9f?auto=format&w=640"
        alt="John Doe"
      />

      <div className="grow text-sm">
        <div className="flex-between mb-1">
          <h3 className="font-medium">John Doe</h3>
          <span className="text-xs text-muted-foreground">2:30 PM</span>
        </div>
        <div className="flex-between">
          <span className="text-muted-foreground">Hey, how are you?</span>
          <div className="flex-center h-5 min-w-5 rounded-full bg-primary p-1 text-xs text-primary-foreground">
            12
          </div>
        </div>
      </div>
    </li>
  );
};

const Chats = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  return (
    <section className="safe-area relative flex h-svh flex-col">
      <div className="page-title !px-0">Chats</div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search chats..."
          className="grow bg-card text-sm focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ul className="thin-scrollbar flex-1 overflow-y-auto pb-10 pt-3">
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
        <SingleChat />
      </ul>

      <div
        className="pointer-events-none absolute bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent dark:from-[#121212]"
        aria-hidden="true"
      />
    </section>
  );
};

export default Chats;
