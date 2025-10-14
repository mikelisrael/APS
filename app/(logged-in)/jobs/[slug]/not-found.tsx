import TransitionLink from "@/components/shared/transition-link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="safe-area flex flex-col items-center gap-6 ~px-2/5">
      <div className="space-y-2 text-center">
        <h2 className="text-4xl font-bold">Job Not Found</h2>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find the job you&apos;re looking for.
        </p>
      </div>

      <Button variant="ghost" asChild className="flex items-center gap-2">
        <TransitionLink href="/jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </TransitionLink>
      </Button>
    </main>
  );
}
