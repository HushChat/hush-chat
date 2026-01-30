import { useEffect, useState, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

/**
 * Returns a boolean indicating whether the app is currently active (in the foreground).
 * Compatible with React Native mobile and web.
 */
export function useAppVisibility(): boolean {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (PLATFORM.IS_WEB) {
      if (typeof document !== "undefined") {
        return document.visibilityState === "visible" && document.hasFocus();
      }
      return true;
    }
    return AppState.currentState === "active";
  });

  const previousStateRef = useRef<boolean>(isActive);

  const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
    const nextIsActive = nextState === "active";

    if (previousStateRef.current !== nextIsActive) {
      previousStateRef.current = nextIsActive;
      setIsActive(nextIsActive);
    }
  }, []);

  const updateActiveState = useCallback((nextIsActive: boolean) => {
    if (previousStateRef.current !== nextIsActive) {
      previousStateRef.current = nextIsActive;
      setIsActive(nextIsActive);
    }
  }, []);

  useEffect(() => {
    if (PLATFORM.IS_WEB) {
      if (typeof document === "undefined") {
        return;
      }

      const handleVisibilityChange = () => {
        updateActiveState(document.visibilityState === "visible" && document.hasFocus());
      };

      const handleFocus = () => {
        updateActiveState(true);
      };

      const handleBlur = () => {
        updateActiveState(false);
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("focus", handleFocus);
      document.addEventListener("blur", handleBlur);

      // mouse enter as a fallback
      document.addEventListener("mouseenter", handleFocus);
      document.addEventListener("mouseleave", handleBlur);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("focus", handleFocus);
        document.removeEventListener("blur", handleBlur);
        document.removeEventListener("mouseenter", handleFocus);
        document.removeEventListener("mouseleave", handleBlur);
      };
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange, updateActiveState]);

  return isActive;
}
