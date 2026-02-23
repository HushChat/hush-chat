import { createContext, useContext, ReactNode } from "react";
import {
  TypingIndicatorWSData,
  UserActivityWSSubscriptionData,
  WebSocketStatus,
} from "@/types/ws/types";
import { CallSignalPayload } from "@/types/call/callSignaling";
import useWebSocketConnection from "@/hooks/ws/useWebSocketConnection";

interface WebSocketContextValue {
  connectionStatus: WebSocketStatus;
  publishActivity: (data: UserActivityWSSubscriptionData) => Promise<boolean>;
  publishTyping: (data: TypingIndicatorWSData) => Promise<boolean>;
  publishCallSignal: (data: CallSignalPayload) => Promise<boolean>;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { connectionStatus, publishActivity, publishTyping, publishCallSignal } =
    useWebSocketConnection();

  return (
    <WebSocketContext.Provider
      value={{ connectionStatus, publishActivity, publishTyping, publishCallSignal }}
    >
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
