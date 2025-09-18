import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

interface AlumnusProps {
  className?: string;
  variant?: "alumnus" | "alumnus-filled";
  showCircle?: boolean;
}

const Alumnus: React.FC<AlumnusProps> = ({
  className,
  variant = "alumnus",
  showCircle = true
}) => {
  return (
    <div className="flex-center w-max gap-1">
      {showCircle && <span>•</span>}

      <Badge variant={variant} className={cn("font-medium", className)}>
        Alumnus
      </Badge>
    </div>
  );
};

export default Alumnus;
