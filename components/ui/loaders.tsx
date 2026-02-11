import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";

interface LoaderProps extends React.PropsWithChildren {
  fullPage?: boolean;
  text?: string;
  className?: string;
}

export const LoaderSpinner = ({
  fullPage,
  text = "Loading...",
  className
}: LoaderProps) => {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center gap-2 text-muted-foreground opacity-80",
        fullPage && "h-svh w-full",
        className
      )}
    >
      <LoaderCircle size={20} className="animate-spin" />
      <span className="text-sm">{text} lala</span>
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
