import Feed from "@/app/(authenticated)/_components/feed";
import NewPost from "@/app/(authenticated)/_components/new-post";
import Extras from "./_components/extras";

const Home = () => {
  return (
    <main>
      <div className="grid lg:grid-cols-[1fr,350px] xl:grid-cols-[1fr,350px]">
        <div>
          <NewPost />
          <Feed />
        </div>

        <Extras />
      </div>
    </main>
  );
};

export default Home;
