import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";

interface LoaderProps extends React.PropsWithChildren {
  fullPage?: boolean;
}

export const LoaderSpinner = ({ fullPage }: LoaderProps) => {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center gap-2 opacity-80",
        fullPage && "h-screen w-screen",
      )}
    >
      <LoaderCircle size={20} className="animate-spin" />
      <span>Loading...</span>
    </div>
  );
};

export const SuspenseLoader = ({ children, fullPage }: LoaderProps) => {
  return (
    <Suspense fallback={<LoaderSpinner fullPage={fullPage} />}>
      {children}
    </Suspense>
  );
};
