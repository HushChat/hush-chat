import { useEffect } from "react";
import { PLATFORM } from "@/constants/platformConstants";
import { ShortcutAction } from "@/constants/keyboardShortcuts";
import { useKeyboardShortcuts } from "@/contexts/KeyboardShortcutsContext";

/**
 * Register a handler for a keyboard shortcut action.
 * Handler is auto-cleaned on unmount.
 *
 * The handler must be wrapped in useCallback to avoid stale closures.
 */
export function useRegisterShortcut(
  action: ShortcutAction,
  handler: () => void,
  enabled: boolean = true
) {
  const { registerAction, unregisterAction } = useKeyboardShortcuts();

  useEffect(() => {
    if (!PLATFORM.IS_WEB || !enabled) return;

    registerAction(action, handler);

    return () => {
      unregisterAction(action);
    };
  }, [action, handler, enabled, registerAction, unregisterAction]);
}
