import { createContext, useContext, ReactNode } from "react";
import { WebSocketStatus } from "@/types/ws/types";
import useWebSocketConnection from "@/hooks/useWebSocketConnection";

interface WebSocketContextValue {
  connectionStatus: WebSocketStatus;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { connectionStatus } = useWebSocketConnection();

  return (
    <WebSocketContext.Provider value={{ connectionStatus }}>{children}</WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
