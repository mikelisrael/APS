import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

interface AlumnusProps {
  className?: string;
  variant?: "alumnus" | "alumnus-filled";
}

const Alumnus: React.FC<AlumnusProps> = ({
  className,
  variant = "alumnus"
}) => {
  return (
    <div className="flex-center w-max gap-1">
      <span>•</span>

      <Badge variant={variant} className={cn("font-medium", className)}>
        Alumnus
      </Badge>
    </div>
  );
};

export default Alumnus;
