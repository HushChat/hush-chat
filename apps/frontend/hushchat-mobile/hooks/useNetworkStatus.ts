import { useEffect, useState, useCallback } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

/**
 * Returns a boolean indicating whether the device is online.
 * Compatible with React Native mobile and web.
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(true);

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
