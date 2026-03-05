import { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from "react";
import { PLATFORM } from "@/constants/platformConstants";
import {
  KEYBOARD_SHORTCUTS,
  ShortcutAction,
  ShortcutDefinition,
} from "@/constants/keyboardShortcuts";

type ActionHandler = () => void;

interface KeyboardShortcutsContextValue {
  registerAction: (action: ShortcutAction, handler: ActionHandler) => void;
  unregisterAction: (action: ShortcutAction) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | undefined>(
  undefined
);

function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;

  const isMac = navigator.platform?.toUpperCase().includes("MAC");
  const modifierPressed = isMac ? event.metaKey : event.ctrlKey;

  if (shortcut.metaOrCtrl && !modifierPressed) return false;
  if (!shortcut.metaOrCtrl && modifierPressed) return false;

  if (shortcut.shift && !event.shiftKey) return false;
  if (!shortcut.shift && event.shiftKey) return false;

  if (shortcut.alt && !event.altKey) return false;
  if (!shortcut.alt && event.altKey) return false;

  return true;
}

function isTypingInInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  if (!target) return false;

  const tagName = target.tagName?.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const handlersRef = useRef<Map<ShortcutAction, ActionHandler>>(new Map());

  const registerAction = useCallback((action: ShortcutAction, handler: ActionHandler) => {
    handlersRef.current.set(action, handler);
  }, []);

  const unregisterAction = useCallback((action: ShortcutAction) => {
    handlersRef.current.delete(action);
  }, []);

  useEffect(() => {
    if (!PLATFORM.IS_WEB) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = KEYBOARD_SHORTCUTS.find((shortcut) =>
        matchesShortcut(event, shortcut)
      );

      if (!matchedShortcut) return;

      // Block non-modifier shortcuts when typing in inputs (except Escape).
      // Modifier shortcuts (Cmd+K, Ctrl+N, etc.) should always fire.
      if (!matchedShortcut.metaOrCtrl && matchedShortcut.key !== "Escape" && isTypingInInput(event))
        return;

      const handler = handlersRef.current.get(matchedShortcut.action);
      if (!handler) return;

      event.preventDefault();
      event.stopPropagation();
      handler();
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return (
    <KeyboardShortcutsContext.Provider value={{ registerAction, unregisterAction }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
  }
  return context;
}
