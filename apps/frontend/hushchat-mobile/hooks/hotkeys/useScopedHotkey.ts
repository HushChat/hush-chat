import { useEffect } from "react";
import { useHotkeyContext } from "./HotkeyProvider";
import { HotkeyDefinition } from "./hotkeyDefinitions";

export function useScopedHotkey(definition: HotkeyDefinition) {
  const { registerHotkey } = useHotkeyContext();

  useEffect(() => {
    const cleanup = registerHotkey(definition);
    return cleanup;
  }, [definition, registerHotkey]);
}