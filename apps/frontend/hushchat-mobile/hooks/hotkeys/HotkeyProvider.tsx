// hooks/hotkeys/HotkeyProvider.tsx
import React, { createContext, useContext, useEffect, useRef } from "react";
import { PLATFORM } from "@/constants/platformConstants";
import { commandHandlers } from "./commandHandlers";
import { normalizeKeyCombo, normalizeHotkeyDefinition, isInputElement } from "./hotkeyUtils";
import { globalHotkeyDefinitions } from "./hotkeyDefinitions";
import { CommandId } from "./commands";

type HotkeyEntry = {
  command: CommandId;
  allowInInput: boolean;
};

type HotkeyContextType = {
  // For future scoped hotkeys
};

const HotkeyContext = createContext<HotkeyContextType | null>(null);

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const hotkeyMapRef = useRef<Map<string, HotkeyEntry>>(new Map());

  // Register global hotkeys on mount
  useEffect(() => {
    if (!PLATFORM.IS_WEB) return;

    globalHotkeyDefinitions.forEach((definition) => {
      const normalizedKey = normalizeHotkeyDefinition(definition.keys);
      hotkeyMapRef.current.set(normalizedKey, {
        command: definition.command,
        allowInInput: definition.allowInInput ?? false,
      });
    });
  }, []);

  // Single keydown listener
  useEffect(() => {
    if (!PLATFORM.IS_WEB) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyCombo = normalizeKeyCombo(event);
      const entry = hotkeyMapRef.current.get(keyCombo);

      if (!entry) return;

      if (!entry.allowInInput && isInputElement(event.target)) {
        return;
      }

      const handler = commandHandlers[entry.command];
      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!PLATFORM.IS_WEB) {
    return <>{children}</>;
  }

  return (
    <HotkeyContext.Provider value={{}}>
      {children}
    </HotkeyContext.Provider>
  );
}

export function useHotkeyContext() {
  const context = useContext(HotkeyContext);
  if (!context) {
    throw new Error("useHotkeyContext must be used within HotkeyProvider");
  }
  return context;
}