import { useMemo } from "react";
import { useGlobalHotkeys } from "./useGlobalHotkeys";
import { useSearchFocus } from "@/contexts/SearchFocusContext";

export function useAppHotkeys() {
  const { focusSearch } = useSearchFocus();

  const hotkeys = useMemo(
    () => [
      {
        key: "k",
        ctrl: true, // This will match both Ctrl+K (Windows/Linux) and Cmd+K (Mac)
        handler: focusSearch,
      },
      // Add more hotkeys here as needed:
      // { key: "n", ctrl: true, handler: createNewChat },
      // { key: "/", handler: focusSearch }, // Slack-style
    ],
    [focusSearch]
  );

  useGlobalHotkeys({ hotkeys });
}
