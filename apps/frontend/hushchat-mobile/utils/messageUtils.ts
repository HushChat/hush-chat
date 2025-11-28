import { format, isToday, isYesterday, parseISO } from "date-fns";
import { IMessage } from "@/types/chat/types";
import { ToastUtils } from "@/utils/toastUtils";
import * as Clipboard from "expo-clipboard";

interface IGroupedMessages {
  title: string;
  data: IMessage[];
}

export const groupMessagesByDate = (messages: readonly IMessage[]): IGroupedMessages[] => {
  if (!messages || messages.length === 0) return [];

  const groupedByDate: Record<string, IMessage[]> = {};

  for (const message of messages) {
    const messageDate = parseISO(message.createdAt);
    const dateKey = format(messageDate, "yyyy-MM-dd");

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }

    groupedByDate[dateKey].push(message);
  }

  const sortedDateKeys = Object.keys(groupedByDate).sort((firstDateKey, secondDateKey) => {
    const firstDate = new Date(firstDateKey).getTime();
    const secondDate = new Date(secondDateKey).getTime();
    return secondDate - firstDate;
  });

  return sortedDateKeys.map((dateKey) => {
    const dateObject = parseISO(dateKey);
    const dateTitle = getDateTitle(dateObject);

    const sortedMessages = [...groupedByDate[dateKey]].sort(
      (firstMessage, secondMessage) =>
        new Date(secondMessage.createdAt).getTime() - new Date(firstMessage.createdAt).getTime()
    );

    return {
      title: dateTitle,
      data: sortedMessages,
    };
  });
};

function getDateTitle(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM dd, yyyy");
}

export const shouldShowSenderAvatar = (
  allMessages: readonly IMessage[],
  index: number,
  isGroupChat: boolean,
  isCurrentUser: boolean
): boolean => {
  if (!isGroupChat || isCurrentUser) return false;

  const current = allMessages[index];
  const next = allMessages[index + 1];

  if (!current) return false;
  if (!next) return true;

  const sameSender = current.senderId === next.senderId;

  return !sameSender;
};

export const copyToClipboard = async (text: string | undefined): Promise<void> => {
  if (!text) return;

  try {
    await Clipboard.setStringAsync(text);
    ToastUtils.success("Copied to clipboard!");
  } catch {
    ToastUtils.error("Failed to copy to clipboard.");
  }
};

export const normalizeUrl = (url: string | undefined | null): string | null => {
  if (!url || !url.trim()) return null;

  const trimmedUrl = url.trim();

  const fullUrl = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    new URL(fullUrl);
    return fullUrl;
  } catch {
    console.warn("Invalid URL encountered:", fullUrl);
    return null;
  }
};
