import { useEffect, useCallback } from "react";
import { PLATFORM } from "@/constants/platformConstants";

type HotkeyHandler = () => void;

type HotkeyConfig = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
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
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      for (const hotkey of hotkeys) {
        const keyMatches = e.key.toLowerCase() === hotkey.key.toLowerCase();
        const ctrlMatches = hotkey.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatches = hotkey.shift ? e.shiftKey : !e.shiftKey;
        const altMatches = hotkey.alt ? e.altKey : !e.altKey;
        const isModifierHotkey = hotkey.ctrl || hotkey.meta;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
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
