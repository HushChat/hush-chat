import { TextInput } from "react-native";
import { CommandId, Commands } from "./commands";

type CommandHandler = () => boolean;

let searchInputRef: React.RefObject<TextInput | null> | null = null;

export function registerSearchInput(ref: React.RefObject<TextInput | null>) {
  searchInputRef = ref;
}

export function unregisterSearchInput() {
  searchInputRef = null;
}

export const commandHandlers: Record<CommandId, CommandHandler> = {
  [Commands.OPEN_SEARCH]: () => {
    if (searchInputRef?.current) {
      searchInputRef.current.focus();
      return true;
    }
    return false;
  },
};
