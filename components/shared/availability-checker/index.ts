export { AvailabilityIcon } from "./availability-icon";
export { AvailabilityMessage } from "./availability-message";
export { AvailabilityInput } from "./availability-input";
export { getAvailabilityInputClassName } from "./availability-styles";

export type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "error";
