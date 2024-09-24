"use client";

import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";

const placeholders = [
  "Search for alumni, students, or projects",
  "Find job opportunities, internships, or mentors",
  "Explore research topics, publications, or tech stacks",
  "Discover networking events, workshops, or seminars",
  "Look up department news",
];

const Search = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-2.5 z-10 size-5 text-muted-foreground" />
      <PlaceholdersAndVanishInput
        query={query}
        setQuery={setQuery}
        placeholders={placeholders}
      />
    </div>
  );
};

export default Search;
