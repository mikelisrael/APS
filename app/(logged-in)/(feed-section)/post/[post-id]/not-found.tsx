import FuzzyText from "@/components/shared/fuzzy-text";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <main className="flex-center h-svh">
      <div className="flex-col-center">
        <FuzzyText baseIntensity={0.2}>404</FuzzyText>
        <p className="mt-4 max-w-sm text-center text-lg font-medium">
          Oops! The post you are looking for does not exist. <br />
          <span className="text-sm">
            It might have been removed or the link is incorrect.
          </span>
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFoundPage;
