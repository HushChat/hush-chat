import { TextInput } from "react-native";
import { CommandId, Commands } from "./commands";

type CommandHandler = () => boolean;

/**
 * Simple registry using module-level variables.
 * Features register their refs here so handlers can access them.
 */

let searchInputRef: React.RefObject<TextInput | null> | null = null;
let chatInputRef: React.RefObject<TextInput> | null = null;
let showShortcutsHelpCallback: (() => void) | null = null;

// Search registration
export function registerSearchInput(ref: React.RefObject<TextInput | null>) {
  searchInputRef = ref;
}

export function unregisterSearchInput() {
  searchInputRef = null;
}


// Chat input registration
export function registerChatInput(ref: React.RefObject<TextInput>) {
  chatInputRef = ref;
}

export function unregisterChatInput() {
  chatInputRef = null;
}

// Shortcuts help registration
export function registerShortcutsHelp(callback: () => void) {
  showShortcutsHelpCallback = callback;
}

export function unregisterShortcutsHelp() {
  showShortcutsHelpCallback = null;
}

/**
 * Map of command IDs to their handler functions.
 * Handlers return true if they successfully handled the command.
 */
export const commandHandlers: Record<CommandId, CommandHandler> = {
  [Commands.OPEN_SEARCH]: () => {
    if (searchInputRef?.current) {
      searchInputRef.current.focus();
      return true;
    }
    return false;
  },

  [Commands.CLEAR_SEARCH]: () => {
    if (searchInputRef?.current) {
      searchInputRef.current.clear();
      searchInputRef.current.focus();
      return true;
    }
    return false;
  },

  [Commands.FOCUS_CHAT_INPUT]: () => {
    if (chatInputRef?.current) {
      chatInputRef.current.focus();
      return true;
    }
    return false;
  },

  [Commands.SHOW_SHORTCUTS_HELP]: () => {
    if (showShortcutsHelpCallback) {
      showShortcutsHelpCallback();
      return true;
    }
    return false;
  },
};