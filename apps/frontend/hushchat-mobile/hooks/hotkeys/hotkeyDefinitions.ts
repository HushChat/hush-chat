import { Commands, CommandId } from "./commands";

export type HotkeyDefinition = {
  keys: string;
  command: CommandId;
  global: boolean;
  description: string;
  allowInInput?: boolean;
};

export const hotkeyDefinitions: HotkeyDefinition[] = [
  {
    keys: "mod+k",
    command: Commands.OPEN_SEARCH,
    global: true,
    description: "Focus search bar",
    allowInInput: true,
  },
  {
    keys: "mod+shift+k",
    command: Commands.CLEAR_SEARCH,
    global: true,
    description: "Clear and focus search bar",
    allowInInput: true,
  },
  {
    keys: "mod+/",
    command: Commands.FOCUS_CHAT_INPUT,
    global: true,
    description: "Focus chat input",
    allowInInput: false,
  },
  {
    keys: "shift+?",
    command: Commands.SHOW_SHORTCUTS_HELP,
    global: true,
    description: "Show keyboard shortcuts",
    allowInInput: false,
  },
];

export const globalHotkeyDefinitions = hotkeyDefinitions.filter((h) => h.global);

export function getHotkeysForHelp(): HotkeyDefinition[] {
  return hotkeyDefinitions;
}