import { useCallback } from "react";
import { useConversationStore } from "@/store/conversation/useConversationStore";

export function useMessageSelection(conversationId?: number) {
  const { selectionMode, selectedMessageIds, setSelectionMode, setSelectedMessageIds } =
    useConversationStore();

  /**
   * Start selection with the first selected message
   */
  const startSelectionWith = useCallback(
    (messageId: number) => {
      if (!conversationId) return;

      setSelectionMode(true);
      setSelectedMessageIds(new Set([messageId]));
    },
    [conversationId, setSelectionMode, setSelectedMessageIds]
  );

  /**
   * Toggle the message selection (add/remove)
   */
  const toggleSelection = useCallback(
    (messageId: number) => {
      const updated = new Set<number>(selectedMessageIds);

      if (updated.has(messageId)) {
        updated.delete(messageId);
      } else {
        updated.add(messageId);
      }

      if (updated.size === 0) {
        setSelectionMode(false);
      }

      setSelectedMessageIds(updated);
    },
    [selectedMessageIds, setSelectedMessageIds, setSelectionMode]
  );

  /**
   * Clear selections and exit selection mode
   */
  const clearSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessageIds(new Set());
  }, [setSelectionMode, setSelectedMessageIds]);

  return {
    selectionMode,
    selectedMessageIds,
    startSelectionWith,
    toggleSelection,
    clearSelection,
  };
}
