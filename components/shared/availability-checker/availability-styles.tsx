import { AvailabilityStatus } from ".";

interface GetInputClassNameOptions {
  unavailableClass?: string;
  errorDomainClass?: string;
}

export const getAvailabilityInputClassName = (
  status: AvailabilityStatus,
  options: GetInputClassNameOptions = {}
): string => {
  const {
    unavailableClass = "border-red-500 focus-visible:!ring-red-500 focus-visible:border-0",
    errorDomainClass = "border-red-500 focus-visible:!ring-red-500 focus-visible:border-0"
  } = options;

  switch (status) {
    case "unavailable":
      return unavailableClass;
    case "error-domain":
      return errorDomainClass;
    default:
      return "";
  }
};
