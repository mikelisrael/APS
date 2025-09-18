import { Check, Loader2, X } from "lucide-react";
import { AvailabilityStatus } from ".";

interface AvailabilityIconProps {
  status: AvailabilityStatus;
  className?: string;
}

export const AvailabilityIcon = ({
  status,
  className = "h-4 w-4"
}: AvailabilityIconProps) => {
  switch (status) {
    case "checking":
      return (
        <Loader2
          className={`${className} animate-spin text-muted-foreground`}
        />
      );
    case "available":
      return <Check className={`${className} text-green-600`} />;
    case "unavailable":
      return <X className={`${className} text-red-600`} />;
    case "error":
      return <X className={`${className} text-red-600`} />;
    case "error-domain":
      return <X className={`${className} text-red-600`} />;
    default:
      return null;
  }
};
