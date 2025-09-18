import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserNotFound() {
  return (
    <main className="container flex max-w-4xl flex-col items-center gap-8 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">User Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The link you followed may be broken, or the page may have been
          removed.
        </p>
      </div>

      <Button variant="ghost" size="lg" asChild>
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </main>
  );
}
