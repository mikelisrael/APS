export { AvailabilityIcon } from "./availability-icon";
export { AvailabilityInput } from "./availability-input";
export { AvailabilityMessage } from "./availability-message";
export { getAvailabilityInputClassName } from "./availability-styles";

export type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error"
  | "error-domain";
