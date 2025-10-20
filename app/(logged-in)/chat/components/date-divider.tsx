import moment from "moment";
import React from "react";
interface DateDividerProps {
  date: string;
  isSticky: boolean;
}

const DateDivider: React.FC<DateDividerProps> = ({ date, isSticky }) => {
  const formatDate = (dateStr: string): string => {
    const msgDate = moment(dateStr);
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    if (msgDate.isSame(today, "day")) {
      return "Today";
    } else if (msgDate.isSame(yesterday, "day")) {
      return "Yesterday";
    } else {
      return msgDate.format("dddd, MMMM D");
    }
  };

  return (
    <div
      className={`flex items-center justify-center py-4 ${isSticky ? "sticky top-0 z-10 bg-white dark:bg-[#121212]" : ""}`}
    >
      <div className="relative flex w-full items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        <span className="mx-4 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-700 dark:bg-[#121212] dark:text-gray-400">
          {formatDate(date)}
        </span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
      </div>
    </div>
  );
};

export default DateDivider;
