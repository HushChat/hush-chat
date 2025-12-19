import { createContext, useContext, ReactNode } from "react";
import { UserActivityWSSubscriptionData, WebSocketStatus } from "@/types/ws/types";
import useWebSocketConnection from "@/hooks/ws/useWebSocketConnection";

interface WebSocketContextValue {
  connectionStatus: WebSocketStatus;
  publishActivity: (data: UserActivityWSSubscriptionData) => boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { connectionStatus, publishActivity } = useWebSocketConnection();

  return (
    <WebSocketContext.Provider value={{ connectionStatus, publishActivity }}>
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
