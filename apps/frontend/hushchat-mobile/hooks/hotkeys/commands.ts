export const Commands = {
  OPEN_SEARCH: "OPEN_SEARCH",
  CLEAR_SEARCH: "CLEAR_SEARCH",
  FOCUS_CHAT_INPUT: "FOCUS_CHAT_INPUT",
  SHOW_SHORTCUTS_HELP: "SHOW_SHORTCUTS_HELP",
} as const;

export type CommandId = (typeof Commands)[keyof typeof Commands];