import { clsx, type ClassValue } from "clsx";
import moment from "moment";
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
  if (data instanceof Date) {
    return data;
  }

  if (typeof data === "string") {
    return data.trim() as any;
  }

  if (Array.isArray(data)) {
    return data.map((item) => trimData(item)) as any;
  }

  if (data !== null && typeof data === "object") {
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

export const formatDate = (date: Date | string | undefined) => {
  if (!date) return "";
  return moment(date).format("MMM YYYY");
};

export const formatDateRange = (
  startDate: Date | string | undefined,
  endDate: Date | string | undefined,
  isCurrent: boolean
) => {
  const start = startDate ? formatDate(startDate) : "";
  let end = "Present";

  if (!isCurrent && endDate) {
    end = formatDate(endDate);
  }

  return `${start} - ${end}`;
};
