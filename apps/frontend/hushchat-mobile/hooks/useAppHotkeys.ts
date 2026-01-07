import { useMemo } from "react";
import { useGlobalHotkeys } from "./useGlobalHotkeys";
import { useSearchFocus } from "@/contexts/SearchFocusContext";

export function useAppHotkeys() {
  const { focusSearch } = useSearchFocus();

  const hotkeys = useMemo(
    () => [
      {
        key: "k",
        ctrl: true, // Will match both Ctrl+K (Windows/Linux) and Cmd+K (Mac)
        handler: focusSearch,
      },
    ],
    [focusSearch]
  );

  useGlobalHotkeys({ hotkeys });
}
