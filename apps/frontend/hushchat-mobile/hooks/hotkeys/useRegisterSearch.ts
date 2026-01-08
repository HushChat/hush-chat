import { useEffect } from "react";
import { TextInput } from "react-native";
import { registerSearchInput, unregisterSearchInput } from "./commandHandlers";

export function useRegisterSearch(inputRef: React.RefObject<TextInput | null>) {
  useEffect(() => {
    registerSearchInput(inputRef);
    return () => unregisterSearchInput();
  }, [inputRef]);
}