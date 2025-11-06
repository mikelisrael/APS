"use client";

import Feed from "@/app/(logged-in)/_components/feed";
import NewPost from "@/app/(logged-in)/_components/new-post";
import { SuspenseLoader } from "@/components/ui/loaders";
import Extras from "./_components/extras";

const Home = () => {
  return (
    <main>
      <div className="grid lg:grid-cols-[1fr,350px] xl:grid-cols-[1fr,350px]">
        <section className="safe-area">
          <NewPost />
          <SuspenseLoader>
            <Feed />
          </SuspenseLoader>
        </section>
        <Extras />
      </div>
    </main>
  );
};

export default Home;
