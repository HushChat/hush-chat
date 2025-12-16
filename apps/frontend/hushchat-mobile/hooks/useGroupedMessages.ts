import { useMemo } from "react";
import { IMessage, MessageAttachmentTypeEnum, MessageTypeEnum } from "@/types/chat/types";

export type GroupedMessage = IMessage & {
  __groupType?: "single" | "image-group";
  __groupMessages?: IMessage[];
  __groupId?: string;
};

type GroupingConfig = {
  maxTimeGapMs?: number;
  currentUserId: number;
};

const DEFAULT_MAX_TIME_GAP_MS = 60 * 1000;
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

const isAttachmentMessage = (message: IMessage): boolean => {
  return (
    message.messageType === MessageTypeEnum.ATTACHMENT ||
    message.hasAttachment === true ||
    (message.messageAttachments && message.messageAttachments.length > 0) ||
    !!(message as any).signedUrl
  );
};

const isImageAttachment = (message: IMessage): boolean => {
  if (!isAttachmentMessage(message)) return false;

  const attachments = message.messageAttachments ?? [];
  if (attachments.length > 0) {
    return attachments.some(
      (att) =>
        att.mimeType?.startsWith("image/") ||
        IMAGE_EXTENSIONS.includes(att.originalFileName?.split(".").pop()?.toLowerCase() || "")
    );
  }

  const signedUrl = (message as any).signedUrl;
  if (signedUrl?.originalFileName) {
    const ext = signedUrl.originalFileName.split(".").pop()?.toLowerCase() || "";
    return IMAGE_EXTENSIONS.includes(ext);
  }

  return false;
};

const getMessageTime = (message: IMessage): number => {
  return new Date(message.createdAt).getTime();
};

const hasCaption = (message: IMessage): boolean => {
  return !!(message.messageText && message.messageText.trim().length > 0);
};

const canGroupMessages = (prev: IMessage, curr: IMessage, maxTimeGapMs: number): boolean => {
  if (prev.senderId !== curr.senderId) return false;

  if (!isImageAttachment(prev) || !isImageAttachment(curr)) return false;

  if (hasCaption(prev) || hasCaption(curr)) return false;

  const timeDiff = Math.abs(getMessageTime(curr) - getMessageTime(prev));
  if (timeDiff > maxTimeGapMs) return false;

  const prevParentId = prev.parentMessage?.id ?? null;
  const currParentId = curr.parentMessage?.id ?? null;
  if (prevParentId !== currParentId) return false;

  if (prev.isUnsend || curr.isUnsend) return false;

  return !(prev.isForwarded || curr.isForwarded);
};

export const normalizeMessageAttachments = (message: IMessage): IMessage => {
  if (message.messageAttachments && message.messageAttachments.length > 0) {
    return message;
  }

  const signedUrl = (message as any).signedUrl;
  if (signedUrl?.url) {
    const ext = signedUrl.originalFileName?.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    return {
      ...message,
      messageAttachments: [
        {
          id: message.id,
          fileUrl: signedUrl.url,
          originalFileName: signedUrl.originalFileName,
          indexedFileName: signedUrl.indexedFileName,
          mimeType: mimeTypes[ext] || "application/octet-stream",
          type: MessageAttachmentTypeEnum.IMAGE,
        },
      ],
      hasAttachment: true,
    };
  }

  return message;
};

export const groupConsecutiveImageMessages = (
  messages: IMessage[],
  config: GroupingConfig
): GroupedMessage[] => {
  const { maxTimeGapMs = DEFAULT_MAX_TIME_GAP_MS } = config;

  if (!messages || messages.length === 0) return [];

  const normalizedMessages = messages.map(normalizeMessageAttachments);

  const result: GroupedMessage[] = [];
  let currentGroup: IMessage[] = [];

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    if (currentGroup.length === 1) {
      result.push({
        ...currentGroup[0],
        __groupType: "single",
        __groupMessages: undefined,
        __groupId: undefined,
      });
    } else {
      const firstMsg = currentGroup[0];
      const lastMsg = currentGroup[currentGroup.length - 1];

      result.push({
        ...firstMsg,
        __groupType: "image-group",
        __groupMessages: [...currentGroup],
        __groupId: `image-group-${firstMsg.id}-${lastMsg.id}`,
      });
    }

    currentGroup = [];
  };

  for (let i = 0; i < normalizedMessages.length; i++) {
    const message = normalizedMessages[i];

    if (message.messageType === MessageTypeEnum.SYSTEM_EVENT) {
      flushGroup();
      result.push({
        ...message,
        __groupType: "single",
        __groupMessages: undefined,
        __groupId: undefined,
      });
      continue;
    }

    if (currentGroup.length === 0) {
      if (isImageAttachment(message)) {
        currentGroup.push(message);
      } else {
        result.push({
          ...message,
          __groupType: "single",
          __groupMessages: undefined,
          __groupId: undefined,
        });
      }
      continue;
    }

    const lastInGroup = currentGroup[currentGroup.length - 1];

    if (canGroupMessages(lastInGroup, message, maxTimeGapMs)) {
      currentGroup.push(message);
    } else {
      flushGroup();

      if (isImageAttachment(message)) {
        currentGroup.push(message);
      } else {
        result.push({
          ...message,
          __groupType: "single",
          __groupMessages: undefined,
          __groupId: undefined,
        });
      }
    }
  }

  flushGroup();

  return result;
};

export const useGroupedMessages = (
  messages: IMessage[],
  currentUserId: number,
  maxTimeGapMs: number = DEFAULT_MAX_TIME_GAP_MS
): GroupedMessage[] => {
  return useMemo(
    () =>
      groupConsecutiveImageMessages(messages, {
        currentUserId,
        maxTimeGapMs,
      }),
    [messages, currentUserId, maxTimeGapMs]
  );
};

export const isImageGroup = (message: GroupedMessage): boolean => {
  return message.__groupType === "image-group" && Array.isArray(message.__groupMessages);
};

export const getGroupMessages = (message: GroupedMessage): IMessage[] => {
  return message.__groupMessages ?? [message];
};
