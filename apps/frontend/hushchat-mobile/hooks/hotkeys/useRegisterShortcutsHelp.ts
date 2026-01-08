import { useEffect } from "react";
import { registerShortcutsHelp, unregisterShortcutsHelp } from "./commandHandlers";

export function useRegisterShortcutsHelp(callback: () => void) {
  useEffect(() => {
    registerShortcutsHelp(callback);
    return () => unregisterShortcutsHelp();
  }, [callback]);
}