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

// Format numbers like Twitter (1.5K, 2.3M, etc.)
export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 1000000) {
    const thousands = count / 1000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }

  const millions = count / 1000000;
  return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
};

// Format relative time (like Twitter)
export const formatRelativeTime = (date: string | Date): string => {
  const now = moment();
  const post = moment(date);

  // If date is invalid, return empty string
  if (!post.isValid()) return "";

  const seconds = now.diff(post, "seconds");
  if (seconds < 60) return `${seconds}s`;

  const minutes = now.diff(post, "minutes");
  if (minutes < 60) return `${minutes}m`;

  const hours = now.diff(post, "hours");
  if (hours < 24) return `${hours}h`;

  const days = now.diff(post, "days");
  if (days < 7) return `${days}d`;

  const weeks = now.diff(post, "weeks");
  if (weeks < 4) return `${weeks}w`;

  // Older than ~4 weeks: show short date, include year if not current year
  const sameYear = now.year() === post.year();
  return post.format(sameYear ? "MMM D" : "MMM D, YYYY");
};
