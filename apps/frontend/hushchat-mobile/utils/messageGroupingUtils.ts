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

/**
 * Determines if a message is the first message in a group
 * A message is the first in a group if:
 * - It's the first message overall (no previous message), OR
 * - It shouldn't be grouped with the previous message (new sender or time gap)
 *
 * Use this to show avatar, sender name, or add top margin
 */
export const isFirstMessageInGroup = (
  currentMessage: IMessage | null,
  previousMessage: IMessage | null
): boolean => {
  if (!currentMessage) {
    return false;
  }

  if (!previousMessage) {
    return true;
  }

  return !shouldGroupMessages(currentMessage, previousMessage);
};
