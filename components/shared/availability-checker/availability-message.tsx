import { cn } from "@/lib/utils";
import { AvailabilityStatus } from ".";

interface AvailabilityMessageProps {
  status: AvailabilityStatus;
  fieldName: string;
  className?: string;
  customMessages?: {
    checking?: string;
    available?: string;
    unavailable?: string;
    error?: string;
  };
}

export const AvailabilityMessage = ({
  status,
  fieldName,
  className = "text-sm",
  customMessages
}: AvailabilityMessageProps) => {
  const getMessage = () => {
    const capitalizedField =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

    switch (status) {
      case "checking":
        return (
          customMessages?.checking || `Checking ${fieldName} availability...`
        );
      case "available":
        return customMessages?.available || `${capitalizedField} is available`;
      case "unavailable":
        return (
          customMessages?.unavailable || `${capitalizedField} is already taken`
        );
      case "error":
        return (
          customMessages?.error || `Error checking ${fieldName} availability`
        );
      case "error-domain":
        return (
          customMessages?.error ||
          `${capitalizedField} should end with @stu.ui.edu.ng`
        );
      default:
        return null;
    }
  };

  const getStatusColorClass = () => {
    switch (status) {
      case "available":
        return "text-green-600";
      case "unavailable":
        return "text-red-600";
      case "checking":
        return "text-muted-foreground";
      case "error":
        return "text-red-600";
      case "error-domain":
        return "text-red-600";
      default:
        return "";
    }
  };

  const message = getMessage();

  if (!message || status === "idle") return null;

  return <p className={cn(className, getStatusColorClass())}>{message}</p>;
};
