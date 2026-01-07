import { useEffect, useCallback } from "react";
import { PLATFORM } from "@/constants/platformConstants";

type HotkeyHandler = () => void;

type HotkeyConfig = {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // For Mac Cmd key
  shift?: boolean;
  alt?: boolean;
  handler: HotkeyHandler;
  preventDefault?: boolean;
};

type UseGlobalHotkeysProps = {
  hotkeys: HotkeyConfig[];
  enabled?: boolean;
};

export function useGlobalHotkeys({ hotkeys, enabled = true }: UseGlobalHotkeysProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea (except for our specific hotkeys)
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      for (const hotkey of hotkeys) {
        const keyMatches = e.key.toLowerCase() === hotkey.key.toLowerCase();
        const ctrlMatches = hotkey.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatches = hotkey.shift ? e.shiftKey : !e.shiftKey;
        const altMatches = hotkey.alt ? e.altKey : !e.altKey;

        // For Ctrl+K style hotkeys, we want them to work even when input is focused
        const isModifierHotkey = hotkey.ctrl || hotkey.meta;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          // Skip if input is focused and it's not a modifier hotkey
          if (isInputFocused && !isModifierHotkey) {
            continue;
          }

          if (hotkey.preventDefault !== false) {
            e.preventDefault();
            e.stopPropagation();
          }
          hotkey.handler();
          return;
        }
      }
    },
    [hotkeys]
  );

  useEffect(() => {
    if (!enabled || !PLATFORM.IS_WEB) return;

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
