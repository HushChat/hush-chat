import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

/**
 * Returns a boolean indicating whether the device is online.
 * Compatible with React Native mobile and web.
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (Platform.OS === "web" && typeof navigator !== "undefined") {
      return navigator.onLine ?? true;
    }
    return true;
  });

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const connected = state.isConnected ?? true;
    const reachable = state.isInternetReachable ?? true;

    if (state.isInternetReachable === null) {
      setIsConnected(connected);
    } else {
      setIsConnected(connected && reachable);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") {
        return;
      }

      const handleOnline = () => setIsConnected(true);
      const handleOffline = () => setIsConnected(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      setIsConnected(navigator.onLine ?? true);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted) {
        handleNetworkChange(state);
      }
    });

    NetInfo.fetch().then((state) => {
      if (isMounted) {
        handleNetworkChange(state);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [handleNetworkChange]);

  return isConnected;
}
