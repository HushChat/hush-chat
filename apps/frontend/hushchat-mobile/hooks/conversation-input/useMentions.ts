/**
 * useMentions
 *
 * Handles @-mention detection, suggestion visibility, and selection.
 */

import { useCallback, useState, RefObject } from "react";
import { TextInput } from "react-native";
import { detectMentionToken, replaceMentionAtCaret, setCaretPosition } from "@/utils/mentionUtils";
import { PLATFORM } from "@/constants/platformConstants";
import type { ConversationParticipant } from "@/types/chat/types";

interface UseMentionsOptions {
  textInputRef: RefObject<TextInput | null>;
  onMessageUpdate: (text: string) => void;
}

interface UseMentionsReturn {
  mentionQuery: string | null;
  mentionVisible: boolean;
  cursorPosition: number;
  setCursorPosition: (pos: number) => void;
  updateMentionQuery: (text: string, position: number) => void;
  handleSelectMention: (participant: ConversationParticipant, currentMessage: string) => string;
  clearMention: () => void;
  triggerMention: () => void;
}

export function useMentions({
  textInputRef,
  onMessageUpdate,
}: UseMentionsOptions): UseMentionsReturn {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const mentionVisible = mentionQuery !== null;

  const updateMentionQuery = useCallback((text: string, position: number) => {
    const token = detectMentionToken(text, position);
    setMentionQuery(token);
  }, []);

  const handleSelectMention = useCallback(
    (participant: ConversationParticipant, currentMessage: string): string => {
      const username = participant.user.username;
      const { nextText, nextCaret } = replaceMentionAtCaret(
        currentMessage,
        cursorPosition,
        username
      );

      onMessageUpdate(nextText);
      setMentionQuery(null);

      if (PLATFORM.IS_WEB) {
        requestAnimationFrame(() => setCaretPosition(textInputRef, nextCaret));
      } else {
        setCursorPosition(nextCaret);
      }

      return nextText;
    },
    [cursorPosition, textInputRef, onMessageUpdate]
  );

  const clearMention = useCallback(() => {
    setMentionQuery(null);
  }, []);

  const triggerMention = useCallback(() => {
    setMentionQuery("");
  }, []);

  return {
    mentionQuery,
    mentionVisible,
    cursorPosition,
    setCursorPosition,
    updateMentionQuery,
    handleSelectMention,
    clearMention,
    triggerMention,
  };
}
