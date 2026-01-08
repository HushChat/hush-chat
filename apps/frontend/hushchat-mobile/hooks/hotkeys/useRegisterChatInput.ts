import { useEffect } from "react";
import { TextInput } from "react-native";
import { registerChatInput, unregisterChatInput } from "./commandHandlers";

export function useRegisterChatInput(inputRef: React.RefObject<TextInput>) {
  useEffect(() => {
    registerChatInput(inputRef);
    return () => unregisterChatInput();
  }, [inputRef]);
}