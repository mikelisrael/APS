import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function trimData<T>(data: T): T {
  if (typeof data === "string") {
    return data.trim() as any;
  } else if (Array.isArray(data)) {
    return data.map((item) => trimData(item)) as any;
  } else if (data !== null && typeof data === "object") {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = trimData((data as any)[key]);
      }
    }
    return result;
  }
  return data;
}
