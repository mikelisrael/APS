import { TextShimmerWave } from "@/components/shared/text-shimmer-wave";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

interface LoaderProps extends React.PropsWithChildren {
  fullPage?: boolean;
}

export const LoaderSpinner = ({ fullPage }: LoaderProps) => {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center gap-2 opacity-80",
        fullPage && "h-svh w-full"
      )}
    >
      <TextShimmerWave className="font-mono text-base" duration={1}>
        loading...
      </TextShimmerWave>
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
