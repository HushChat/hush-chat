import { useState, useCallback } from "react";

export function useMessageReactions() {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [reactionsModal, setReactionsModal] = useState<{
    visible: boolean;
    messageId: number | null;
  }>({
    visible: false,
    messageId: null,
  });

  /**
   * Opens the reactions modal and stores menu position.
   */
  const viewReactions = useCallback(
    (messageId: number, position: { x: number; y: number }, isOpen: boolean) => {
      setMenuPosition(position);
      setReactionsModal({
        visible: isOpen,
        messageId,
      });
    },
    []
  );

  /**
   * Closes reactions modal without clearing position.
   */
  const closeReactions = useCallback(() => {
    setReactionsModal((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return {
    reactionsModal,
    menuPosition,
    viewReactions,
    closeReactions,
  };
}
