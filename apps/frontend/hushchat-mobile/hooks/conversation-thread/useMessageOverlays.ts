import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import type { IMessage, ConversationAPIResponse, IMessageAttachment } from "@/types/chat/types";

export function useMessageOverlays(
  conversation: ConversationAPIResponse | undefined,
  onMessageSelect?: (message: IMessage) => void
) {
  const [selectedActionMessage, setSelectedActionMessage] = useState<IMessage | null>(null);
  const [openPickerMessageId, setOpenPickerMessageId] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<IMessageAttachment | null>(null);

  /**
   * Long press -> open actions (pin, copy, forward, unsend)
   */
  const openActions = useCallback(
    (message: IMessage, attachment?: IMessageAttachment) => {
      if (conversation?.isBlocked) return;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedActionMessage(message);
      setSelectedAttachment(attachment || null);
    },
    [conversation?.isBlocked]
  );

  /**
   * Close actions overlay
   */
  const closeActions = useCallback(() => {
    setSelectedActionMessage(null);
    setSelectedAttachment(null);
  }, []);

  /**
   * Open picker (emoji / reaction / menu)
   */
  const openPicker = useCallback((messageId: string) => {
    setOpenPickerMessageId(messageId);
  }, []);

  /**
   * Select message (tap message)
   */
  const selectMessage = useCallback(
    (message: IMessage) => {
      setOpenPickerMessageId(null);
      onMessageSelect?.(message);
    },
    [onMessageSelect]
  );

  /**
   * Close all overlays at once
   */
  const closeAll = useCallback(() => {
    setOpenPickerMessageId(null);
    setSelectedActionMessage(null);
    setSelectedAttachment(null);
  }, []);

  return {
    selectedActionMessage,
    selectedAttachment,
    openPickerMessageId,
    openActions,
    closeActions,
    openPicker,
    selectMessage,
    closeAll,
    setOpenPickerMessageId,
  };
}
