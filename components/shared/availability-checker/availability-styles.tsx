type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";

interface GetInputClassNameOptions {
  unavailableClass?: string;
}

export const getAvailabilityInputClassName = (
  status: AvailabilityStatus,
  options: GetInputClassNameOptions = {}
): string => {
  const {
    unavailableClass = "border-red-500 focus-visible:!ring-red-500 focus-visible:border-0"
  } = options;

  switch (status) {
    case "unavailable":
      return unavailableClass;
    default:
      return "";
  }
};
