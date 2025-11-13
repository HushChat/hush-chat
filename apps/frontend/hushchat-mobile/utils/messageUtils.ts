import { format, isToday, isYesterday, parseISO } from "date-fns";
import _ from "lodash";
import { IMessage } from "@/types/chat/types";

export const groupMessagesByDate = (messages: IMessage[]) => {
  if (!messages?.length) return [];

  const grouped = _.groupBy(messages, (msg: { createdAt: string }) =>
    format(parseISO(msg.createdAt), "yyyy-MM-dd")
  );

  const sortedKeys = _.orderBy(
    Object.keys(grouped),
    (d: string | number | Date) => new Date(d).getTime(),
    "desc"
  );

  return sortedKeys.map((dateKey: string) => {
    const dateObj = parseISO(dateKey);

    const sortedMessages = _.orderBy(
      grouped[dateKey],
      (msg: { createdAt: string | number | Date }) => new Date(msg.createdAt).getTime(),
      "asc"
    );

    return {
      title: getDateTitle(dateObj),
      data: sortedMessages,
    };
  });
};

const getDateTitle = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM dd, yyyy");
};
