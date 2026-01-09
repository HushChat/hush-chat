import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  CONVERSATION_MESSAGE_QUERY_BASE_KEY,
  CONVERSATION_QUERY_BASE_KEY,
} from "@/constants/queryKeys";

export const useRefreshOnAppStateChange = () => {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_BASE_KEY] });
        queryClient.invalidateQueries({ queryKey: [CONVERSATION_MESSAGE_QUERY_BASE_KEY] });
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [queryClient]);
};
