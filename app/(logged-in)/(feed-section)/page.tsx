"use client";

import Feed from "@/app/(logged-in)/_components/feed";
import NewPost from "@/app/(logged-in)/_components/new-post";

const Home = () => {
  return (
    <>
      <NewPost />
      <Feed />
    </>
  );
};

export default Home;
