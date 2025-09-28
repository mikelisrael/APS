import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-amber-600 text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        alumnus:
          "border-transparent bg-transparent p-0 text-amber-600 dark:text-amber-500 font-semibold",
        ["alumnus-filled"]:
          "border-transparent bg-amber-600/10 border-amber-600/40 text-amber-600 font-semibold dark:text-amber-500",
        primary: "border-transparent bg-primary/20 text-primary",
        ["part-time"]:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        internship:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
