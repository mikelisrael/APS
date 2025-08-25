import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const Spinner = ({
  size,
  className
}: {
  size?: number;
  className?: string;
}) => {
  return <LoaderCircle size={size} className={cn("animate-spin", className)} />;
};

export default Spinner;
