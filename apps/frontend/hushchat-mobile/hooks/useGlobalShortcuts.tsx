import React, { useCallback } from "react";
import { router } from "expo-router";
import { SHORTCUT_ACTIONS } from "@/constants/keyboardShortcuts";
import { CHATS_PATH } from "@/constants/routes";
import { useRegisterShortcut } from "@/hooks/useRegisterShortcut";
import { useModalContext } from "@/context/modal-context";
import { useShortcutSignalStore } from "@/store/shortcut/useShortcutSignalStore";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";

/**
 * Registers global keyboard shortcuts that work from any screen.
 * Navigation-related shortcuts navigate to conversations tab
 * and signal the sidebar via the shortcut signal store.
 */
export function useGlobalShortcuts() {
  const { openModal, closeModal } = useModalContext();
  const setPendingSignal = useShortcutSignalStore((s) => s.setPendingSignal);

  useRegisterShortcut(
    SHORTCUT_ACTIONS.FOCUS_SEARCH,
    useCallback(() => {
      setPendingSignal("focusSearch");
      router.push(CHATS_PATH);
    }, [setPendingSignal])
  );

  useRegisterShortcut(
    SHORTCUT_ACTIONS.NEW_CONVERSATION,
    useCallback(() => {
      setPendingSignal("newConversation");
      router.push(CHATS_PATH);
    }, [setPendingSignal])
  );

  useRegisterShortcut(
    SHORTCUT_ACTIONS.TOGGLE_MENTIONED_MESSAGES,
    useCallback(() => {
      setPendingSignal("toggleMentionedMessages");
      router.push(CHATS_PATH);
    }, [setPendingSignal])
  );

  useRegisterShortcut(
    SHORTCUT_ACTIONS.SHOW_SHORTCUTS_HELP,
    useCallback(() => {
      openModal({
        type: "custom",
        title: "Keyboard Shortcuts",
        children: <KeyboardShortcutsHelp />,
        buttons: [{ text: "Close", onPress: closeModal, variant: "default" }],
      });
    }, [openModal, closeModal])
  );
}
