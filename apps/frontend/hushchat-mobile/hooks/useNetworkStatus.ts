import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
};
