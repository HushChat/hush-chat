import { format, isToday, isYesterday, parseISO } from "date-fns";
import { IMessage } from "@/types/chat/types";
import { ToastUtils } from "@/utils/toastUtils";
import * as Clipboard from "expo-clipboard";
import {
  groupConsecutiveImageMessages,
  GroupedMessage,
  normalizeMessageAttachments,
} from "@/hooks/useGroupedMessages";

type TDateSection = {
  title: string;
  data: GroupedMessage[];
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
  if (!isGroupChat) return false;

  if (isCurrentUser) return false;

  const current = allMessages[index];
  const next = allMessages[index + 1];

  if (!current) return false;
  if (!next) return true;

  const sameSender = current.senderId === next.senderId;

  return !sameSender;
};

export const shouldShowSenderName = (
  allMessages: readonly IMessage[],
  index: number,
  isGroupChat: boolean
): boolean => {
  if (!isGroupChat) return false;

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

export const groupMessagesByDateWithImageGroups = (
  messages: IMessage[],
  currentUserId: number
): TDateSection[] => {
  if (!messages || messages.length === 0) return [];

  const normalizedMessages = messages.map(normalizeMessageAttachments);

  const groupedByDate: Record<string, IMessage[]> = {};

  for (const message of normalizedMessages) {
    const messageDate = parseISO(message.createdAt);
    const dateKey = format(messageDate, "yyyy-MM-dd");

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(message);
  }

  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return sortedDateKeys.map((dateKey) => {
    const dateObject = parseISO(dateKey);
    const dateTitle = getDateTitle(dateObject);

    const sortedMessages = [...groupedByDate[dateKey]].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const groupedMessages = groupConsecutiveImageMessages(sortedMessages, {
      currentUserId,
      maxTimeGapMs: 60000,
    });

    return {
      title: dateTitle,
      data: groupedMessages,
    };
  });
};
