import { useCallback, useRef } from "react";
import { logDebug, logInfo } from "@/utils/logger";
import { HEADER_DESTINATION } from "@/constants/constants";
import { WS_DESTINATIONS } from "@/constants/apiConstants";

const encoder = new TextEncoder();

export const HEARTBEAT_INTERVAL = 30000;
const MISSED_HEARTBEAT_THRESHOLD = 2;

export const useHeartbeat = () => {
  const heartbeatIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageTimeRef = useRef<number>(Date.now());

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
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

        const pingFrame = new Uint8Array([
          ...Array.from(encoder.encode("SEND\n")),
          ...Array.from(encoder.encode(`${HEADER_DESTINATION}:${WS_DESTINATIONS.HEARTBEAT}\n`)),
          0x0a,
          0x00,
        ]);
        ws.send(pingFrame.buffer);
        logDebug("Heartbeat sent");
      } catch (error) {
        logInfo("Error sending heartbeat:", error);
      }
    }
  }, []);

  const startHeartbeat = useCallback(
    (ws: WebSocket) => {
      stopHeartbeat();

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
