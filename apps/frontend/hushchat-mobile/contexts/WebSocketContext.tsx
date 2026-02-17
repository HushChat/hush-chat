import { createContext, useContext, ReactNode } from "react";
import {
  TypingIndicatorWSData,
  UserActivityWSSubscriptionData,
  WebSocketStatus,
} from "@/types/ws/types";
import useWebSocketConnection from "@/hooks/ws/useWebSocketConnection";

interface WebSocketContextValue {
  connectionStatus: WebSocketStatus;
  publishActivity: (data: UserActivityWSSubscriptionData) => Promise<boolean>;
  publishTyping: (data: TypingIndicatorWSData) => Promise<boolean>;
  getWebSocket: () => WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { connectionStatus, publishActivity, publishTyping, getWebSocket } = useWebSocketConnection();

  return (
    <WebSocketContext.Provider value={{ connectionStatus, publishActivity, publishTyping, getWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
