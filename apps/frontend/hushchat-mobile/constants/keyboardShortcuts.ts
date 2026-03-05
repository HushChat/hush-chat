export const SHORTCUT_ACTIONS = {
  FOCUS_SEARCH: "shortcut:focusSearch",
  NEW_CONVERSATION: "shortcut:newConversation",
  TOGGLE_MENTIONED_MESSAGES: "shortcut:toggleMentionedMessages",
  CLOSE_OVERLAY: "shortcut:closeOverlay",
  SHOW_SHORTCUTS_HELP: "shortcut:showShortcutsHelp",
} as const;

export type ShortcutAction = (typeof SHORTCUT_ACTIONS)[keyof typeof SHORTCUT_ACTIONS];

export interface ShortcutDefinition {
  action: ShortcutAction;
  label: string;
  key: string;
  metaOrCtrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  category: "navigation" | "conversation" | "general";
}

/**
 * Central shortcut registry — single source of truth.
 *
 * To add a new shortcut:
 * 1. Add an action to SHORTCUT_ACTIONS
 * 2. Add a ShortcutDefinition entry here
 * 3. Call useRegisterShortcut(action, handler) in the owning component
 */
export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
  {
    action: SHORTCUT_ACTIONS.FOCUS_SEARCH,
    label: "Focus search",
    key: "k",
    metaOrCtrl: true,
    category: "navigation",
  },
  {
    action: SHORTCUT_ACTIONS.NEW_CONVERSATION,
    label: "New conversation",
    key: "n",
    metaOrCtrl: true,
    category: "conversation",
  },
  {
    action: SHORTCUT_ACTIONS.TOGGLE_MENTIONED_MESSAGES,
    label: "Toggle mentioned messages",
    key: "m",
    metaOrCtrl: true,
    shift: true,
    category: "conversation",
  },
  {
    action: SHORTCUT_ACTIONS.CLOSE_OVERLAY,
    label: "Close overlay",
    key: "Escape",
    category: "general",
  },
  {
    action: SHORTCUT_ACTIONS.SHOW_SHORTCUTS_HELP,
    label: "Show keyboard shortcuts",
    key: "/",
    metaOrCtrl: true,
    category: "general",
  },
];
