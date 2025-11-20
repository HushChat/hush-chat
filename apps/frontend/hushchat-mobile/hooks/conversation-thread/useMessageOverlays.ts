// /hooks/conversation-thread/useMessageOverlays.ts

import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import type { IMessage, ConversationAPIResponse } from "@/types/chat/types";

export function useMessageOverlays(
  conversation: ConversationAPIResponse | undefined,
  onMessageSelect?: (message: IMessage) => void
) {
  const [selectedActionMessage, setSelectedActionMessage] = useState<IMessage | null>(null);
  const [openPickerMessageId, setOpenPickerMessageId] = useState<string | null>(null);

  /**
   * Long press → open actions (pin, copy, forward, unsend)
   */
  const openActions = useCallback(
    (message: IMessage) => {
      if (conversation?.isBlocked) return;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedActionMessage(message);
    },
    [conversation?.isBlocked]
  );

  /**
   * Close actions overlay
   */
  const closeActions = useCallback(() => {
    setSelectedActionMessage(null);
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
  }, []);

  return {
    selectedActionMessage,
    openPickerMessageId,
    openActions,
    closeActions,
    openPicker,
    selectMessage,
    closeAll,
    setOpenPickerMessageId,
  };
}
