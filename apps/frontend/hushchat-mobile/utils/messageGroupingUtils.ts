/**
 * Message Grouping Utilities
 * Determines how messages should be grouped in the conversation thread
 */

import { IMessage } from "@/types/chat/types";

const GROUP_TIME_THRESHOLD_MS = 60000;

/**
 * Determines if two messages should be grouped together
 * Messages are grouped if:
 * - They're from the same sender
 * - They're sent within the time threshold
 * - Neither is a system event
 * - Neither is unsent
 */
export const shouldGroupMessages = (
  currentMessage: IMessage | null,
  previousMessage: IMessage | null
): boolean => {
  if (!previousMessage || !currentMessage) {
    return false;
  }

  if (
    currentMessage.messageType === "SYSTEM_EVENT" ||
    previousMessage.messageType === "SYSTEM_EVENT"
  ) {
    return false;
  }

  if (currentMessage.isUnsend || previousMessage.isUnsend) {
    return false;
  }

  if (!currentMessage.senderId || !previousMessage.senderId) {
    return false;
  }

  if (currentMessage.senderId !== previousMessage.senderId) {
    return false;
  }

  if (!currentMessage.createdAt || !previousMessage.createdAt) {
    return false;
  }

  const currentTime = new Date(currentMessage.createdAt).getTime();
  const previousTime = new Date(previousMessage.createdAt).getTime();

  if (isNaN(currentTime) || isNaN(previousTime)) {
    return false;
  }

  const timeDiff = Math.abs(currentTime - previousTime);

  return timeDiff <= GROUP_TIME_THRESHOLD_MS;
};
