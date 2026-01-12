import { useEffect, useState, useCallback, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

/**
 * Returns a boolean indicating whether the app is currently active (in the foreground).
 * Compatible with React Native mobile and web.
 */
export function useAppVisibility(): boolean {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (Platform.OS === "web") {
      if (typeof document !== "undefined") {
        return document.visibilityState === "visible";
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

  const handleVisibilityChange = useCallback(() => {
    if (typeof document !== "undefined") {
      const nextIsActive = document.visibilityState === "visible";

      // Only update if state actually changed
      if (previousStateRef.current !== nextIsActive) {
        previousStateRef.current = nextIsActive;
        setIsActive(nextIsActive);
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof document === "undefined") {
        return;
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);

      const handleFocus = () => {
        if (!previousStateRef.current) {
          previousStateRef.current = true;
          setIsActive(true);
        }
      };

      const handleBlur = () => {
        //
      };

      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleBlur);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("blur", handleBlur);
      };
    }

    // Native
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange, handleVisibilityChange]);

  return isActive;
}
