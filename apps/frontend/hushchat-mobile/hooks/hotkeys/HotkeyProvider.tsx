import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { PLATFORM } from "@/constants/platformConstants";
import { CommandId } from "./commands";
import { commandHandlers } from "./commandHandlers";
import {
  normalizeKeyCombo,
  normalizeHotkeyDefinition,
  isInputElement,
} from "./hotkeyUtils";
import { globalHotkeyDefinitions, HotkeyDefinition } from "./hotkeyDefinitions";

type HotkeyEntry = {
  command: CommandId;
  allowInInput: boolean;
};

type HotkeyContextType = {
  registerHotkey: (definition: HotkeyDefinition) => () => void;
  executeCommand: (command: CommandId) => void;
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

    return () => {
      globalHotkeyDefinitions.forEach((definition) => {
        const normalizedKey = normalizeHotkeyDefinition(definition.keys);
        hotkeyMapRef.current.delete(normalizedKey);
      });
    };
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

  const registerHotkey = useCallback((definition: HotkeyDefinition) => {
    const normalizedKey = normalizeHotkeyDefinition(definition.keys);

    hotkeyMapRef.current.set(normalizedKey, {
      command: definition.command,
      allowInInput: definition.allowInInput ?? false,
    });

    return () => {
      hotkeyMapRef.current.delete(normalizedKey);
    };
  }, []);

  const executeCommand = useCallback((command: CommandId) => {
    const handler = commandHandlers[command];
    if (handler) {
      handler();
    }
  }, []);

  if (!PLATFORM.IS_WEB) {
    return (
      <HotkeyContext.Provider
        value={{
          registerHotkey: () => () => {},
          executeCommand: () => {},
        }}
      >
        {children}
      </HotkeyContext.Provider>
    );
  }

  return (
    <HotkeyContext.Provider value={{ registerHotkey, executeCommand }}>
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