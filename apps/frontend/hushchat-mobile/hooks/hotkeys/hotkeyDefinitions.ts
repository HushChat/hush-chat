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
];

export const globalHotkeyDefinitions = hotkeyDefinitions.filter((h) => h.global);

export function getHotkeysForHelp(): HotkeyDefinition[] {
  return hotkeyDefinitions;
}