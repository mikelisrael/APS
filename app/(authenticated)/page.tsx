import NewPost from "@/components/home/new-post";
import Feed from "@/components/home/feed";
import React from "react";
import { SuspenseLoader } from "@/components/ui/loaders";

const Home = () => {
  return (
    <SuspenseLoader fullPage>
      <NewPost />
      <Feed />
    </SuspenseLoader>
  );
};

export default Home;
