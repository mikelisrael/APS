import moment from "moment";

export const formatChatTime = (timestamp: string | Date): string => {
  const messageDate = moment(timestamp);
  const today = moment().startOf("day");
  const yesterday = moment().subtract(1, "days").startOf("day");

  if (messageDate.isSame(today, "day")) {
    // Today - show time in 24-hour format (e.g., 15:11, 02:30)
    return messageDate.format("HH:mm");
  } else if (messageDate.isSame(yesterday, "day")) {
    // Yesterday
    return "Yesterday";
  } else if (messageDate.isSame(today, "year")) {
    // Same year but not today or yesterday - show month and day (e.g., Oct. 25)
    return messageDate.format("MMM. DD");
  } else {
    // Different year - show month, day and year (e.g., Oct. 25, 2023)
    return messageDate.format("MMM. DD, YYYY");
  }
};
