import { useCallback, useRef } from "react";
import { logDebug, logInfo } from "@/utils/logger";

export const HEARTBEAT_INTERVAL = 30000;
const MISSED_HEARTBEAT_THRESHOLD = 2;

export const useHeartbeat = () => {
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageTimeRef = useRef<number>(Date.now());

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const sendHeartbeat = useCallback((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        const timeSinceLastMessage = Date.now() - lastMessageTimeRef.current;
        const timeoutThreshold = HEARTBEAT_INTERVAL * (MISSED_HEARTBEAT_THRESHOLD + 1);

        if (timeSinceLastMessage > timeoutThreshold) {
          logInfo(
            `No messages received for ${timeSinceLastMessage}ms (threshold: ${timeoutThreshold}ms), reconnecting...`
          );
          ws.close(4000, "Heartbeat timeout - no messages received");
          return;
        }

        const heartbeatFrame = new Uint8Array([0x0a]);
        ws.send(heartbeatFrame.buffer);
        logDebug("Heartbeat sent");
      } catch (error) {
        logInfo("Error sending heartbeat:", error);
      }
    }
  }, []);

  const startHeartbeat = useCallback(
    (ws: WebSocket) => {
      stopHeartbeat();
      lastMessageTimeRef.current = Date.now();

      heartbeatIntervalRef.current = setInterval(() => {
        sendHeartbeat(ws);
      }, HEARTBEAT_INTERVAL);

      logDebug("Heartbeat started");
    },
    [sendHeartbeat, stopHeartbeat]
  );

  const updateLastMessageTime = useCallback(() => {
    lastMessageTimeRef.current = Date.now();
  }, []);

  return {
    startHeartbeat,
    stopHeartbeat,
    updateLastMessageTime,
    lastMessageTimeRef,
  };
};
