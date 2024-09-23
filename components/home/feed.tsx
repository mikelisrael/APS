import React from "react";
import Post from "./post";

const Feed = () => {
  return (
    <section className="mt-5 grid gap-5 border-t border-border px-5 pt-5">
      <Post />
      <Post />
      <Post />
      <Post />
    </section>
  );
};

export default Feed;
