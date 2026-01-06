import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  IBasicMessage,
  IMessage,
  IMessageAttachment,
  MessageAttachmentTypeEnum,
  MessageTypeEnum,
} from "@/types/chat/types";
import { ToastUtils } from "@/utils/toastUtils";
import * as Clipboard from "expo-clipboard";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Linking } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

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

const getNextUserMessage = (
  allMessages: readonly IMessage[],
  startIndex: number
): IMessage | undefined => {
  for (let i = startIndex + 1; i < allMessages.length; i++) {
    if (allMessages[i].messageType !== MessageTypeEnum.SYSTEM_EVENT) {
      return allMessages[i];
    }
  }
  return undefined;
};

export const shouldShowSenderAvatar = (
  allMessages: readonly IMessage[],
  index: number,
  isGroupChat: boolean,
  isCurrentUser: boolean
): boolean => {
  if (!isGroupChat) return false;
  if (isCurrentUser) return false;

  const current = allMessages[index];
  if (!current || current.messageType === MessageTypeEnum.SYSTEM_EVENT) return false;

  const next = getNextUserMessage(allMessages, index);
  if (!next) return true;

  return current.senderId !== next.senderId;
};

export const shouldShowSenderName = (
  allMessages: readonly IMessage[],
  index: number,
  isGroupChat: boolean
): boolean => {
  if (!isGroupChat) return false;

  const current = allMessages[index];
  if (!current || current.messageType === "SYSTEM_EVENT") return false;

  const next = getNextUserMessage(allMessages, index);
  if (!next) return true;

  return current.senderId !== next.senderId;
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

export const downloadFileNative = async (attachment: IMessageAttachment): Promise<void> => {
  if (!PLATFORM.IS_WEB) {
    const fileUrl = attachment.fileUrl;
    const fileName = attachment.originalFileName || attachment.indexedFileName;

    try {
      const cacheDir = new Directory(Paths.cache, "downloads");

      if (!cacheDir.exists) {
        await cacheDir.create();
      }

      const destinationFile = new File(cacheDir, fileName);

      if (destinationFile.exists) {
        try {
          const fileSize = destinationFile.size;

          if (fileSize && fileSize > 0) {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(destinationFile.uri, {
                mimeType: attachment.mimeType || "application/octet-stream",
              });
            } else {
              ToastUtils.success("Document ready");
            }
            return;
          } else {
            await destinationFile.delete();
          }
        } catch {
          try {
            await destinationFile.delete();
          } catch {
            return;
          }
        }
      }

      await File.downloadFileAsync(fileUrl, destinationFile);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(destinationFile.uri, {
          mimeType: attachment.mimeType || "application/octet-stream",
        });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      ToastUtils.error("Failed to download document");
    }
  }
};

export const downloadFileWeb = async (fileUrl: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file on web:", error);
    throw error;
  }
};

export const openFileNative = async (fileUrl: string): Promise<void> => {
  try {
    const canOpen = await Linking.canOpenURL(fileUrl);

    if (canOpen) {
      await Linking.openURL(fileUrl);
    } else {
      ToastUtils.error("Cannot open this file");
    }
  } catch (error) {
    console.error("Error opening file on native:", error);
    throw error;
  }
};

const getGifAttachment = (message?: IMessage | IBasicMessage): IMessageAttachment | undefined => {
  if (!message?.messageAttachments) return undefined;

  return message.messageAttachments.find(
    (attachment) => attachment.type === MessageAttachmentTypeEnum.GIF
  );
};

export const hasGif = (message?: IMessage | IBasicMessage): boolean => {
  return !!getGifAttachment(message);
};

export const getGifUrl = (message?: IMessage | IBasicMessage): string | undefined => {
  return getGifAttachment(message)?.indexedFileName;
};

// Helper function to truncate text based on character count
export const truncateCharacters = (text: string, limit: number) => {
  if (text.length > limit) {
    return text.substring(0, limit) + "...";
  }
  return text;
};
