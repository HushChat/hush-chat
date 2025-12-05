import { useCallback, useState, RefObject } from "react";
import { TextInput } from "react-native";
import { detectMentionToken, replaceMentionAtCaret, setCaretPosition } from "@/utils/mentionUtils";
import { PLATFORM } from "@/constants/platformConstants";
import type { ConversationParticipant } from "@/types/chat/types";

type TMentionsOptions = {
  textInputRef: RefObject<TextInput | null>;
  onMessageUpdate: (updatedMessageText: string) => void;
};

interface IMentionsReturn {
  activeMentionQueryText: string | null;
  isMentionSuggestionsVisible: boolean;
  currentCursorIndex: number;
  validMentions: Set<string>;
  updateCursorIndex: (newPosition: number) => void;
  evaluateMentionQueryFromInput: (messageText: string, caretIndex: number) => void;
  handleUserSelectedMention: (
    selectedParticipant: ConversationParticipant,
    existingMessageText: string
  ) => string;
  clearActiveMentionQuery: () => void;
  manuallyTriggerMentionPicker: () => void;
  clearValidMentions: () => void;
}

export function useMentions({ textInputRef, onMessageUpdate }: TMentionsOptions): IMentionsReturn {
  const [activeMentionQueryText, setActiveMentionQueryText] = useState<string | null>(null);
  const [currentCursorIndex, updateCursorIndex] = useState<number>(0);
  const [validMentions, setValidMentions] = useState<Set<string>>(new Set());

  const isMentionSuggestionsVisible = activeMentionQueryText !== null;

  const evaluateMentionQueryFromInput = useCallback((messageText: string, caretIndex: number) => {
    const mentionToken = detectMentionToken(messageText, caretIndex);
    setActiveMentionQueryText(mentionToken);
  }, []);

  const handleUserSelectedMention = useCallback(
    (selectedParticipant: ConversationParticipant, existingMessageText: string): string => {
      const selectedUsername = selectedParticipant.user.username;

      const { nextText: updatedMessageText, nextCaret } = replaceMentionAtCaret(
        existingMessageText,
        currentCursorIndex,
        selectedUsername
      );

      setValidMentions((prev) => new Set(prev).add(selectedUsername));

      onMessageUpdate(updatedMessageText);
      setActiveMentionQueryText(null);

      if (PLATFORM.IS_WEB) {
        requestAnimationFrame(() => setCaretPosition(textInputRef, nextCaret));
      } else {
        updateCursorIndex(nextCaret);
      }

      return updatedMessageText;
    },
    [currentCursorIndex, textInputRef, onMessageUpdate]
  );

  const clearActiveMentionQuery = useCallback(() => {
    setActiveMentionQueryText(null);
  }, []);

  const manuallyTriggerMentionPicker = useCallback(() => {
    setActiveMentionQueryText("");
  }, []);

  const clearValidMentions = useCallback(() => {
    setValidMentions(new Set());
  }, []);

  return {
    activeMentionQueryText,
    isMentionSuggestionsVisible,
    currentCursorIndex,
    validMentions,
    updateCursorIndex,
    evaluateMentionQueryFromInput,
    handleUserSelectedMention,
    clearActiveMentionQuery,
    manuallyTriggerMentionPicker,
    clearValidMentions,
  };
}
