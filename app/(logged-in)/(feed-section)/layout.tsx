import { SuspenseLoader } from "@/components/ui/loaders";
import Extras from "../_components/extras";

const Home = ({ children }: { children: React.ReactNode }) => {
  return (
    <SuspenseLoader fullPage>
      <main className="relative">
        <div className="grid lg:grid-cols-[1fr,350px] xl:grid-cols-[1fr,350px]">
          <section className="safe-area">{children}</section>
          <Extras />
        </div>
      </main>
    </SuspenseLoader>
  );
};

export default Home;
