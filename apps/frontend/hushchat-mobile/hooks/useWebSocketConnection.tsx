import { useAuthStore } from "@/store/auth/authStore";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { getAllTokens, decodeJWTToken } from "@/utils/authUtils";
import { getWSBaseURL } from "@/utils/apiUtils";
import { emitNewMessage } from "@/services/eventBus";
import { IConversation } from "@/types/chat/types";
import { MESSAGE_RECEIVED_TOPIC } from "@/constants/wsConstants";
import { WebSocketStatus } from "@/types/ws/types";
import { logDebug, logInfo } from "@/utils/logger";

interface DecodedJWTPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
  custom_user_type?: string;
  custom_tenant?: string;

  [key: string]: any;
}

const RETRY_TIME_MS = 10000;
const RETRY_FOR_MISSING_WORKSPACE = 1000;
const INVALID_ACCESS_TOKEN_ERROR = "Invalid access token format or structure";
const ERROR_RESPONSE = "ERROR";
const MESSAGE_RESPONSE = "MESSAGE";
const CONNECTED_RESPONSE = "CONNECTED";

const decodeAndValidateToken = (
  tokenToDecode: string
): {
  isValid: boolean;
  decodedToken?: DecodedJWTPayload;
  error?: string;
} => {
  try {
    const decoded = decodeJWTToken(tokenToDecode);
    const currentTime = new Date();
    const expiryTime = new Date(decoded.exp * 1000);

    return {
      isValid: expiryTime.getTime() > currentTime.getTime(),
    };
  } catch {
    return {
      isValid: false,
      error: INVALID_ACCESS_TOKEN_ERROR,
    };
  }
};

export default function useWebSocketConnection() {
  const { isAuthenticated } = useAuthStore();
  const {
    user: { email },
  } = useUserStore();
  const wsRef = useRef<WebSocket | null>(null);
  const shouldStopRetrying = useRef(false);

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(
    WebSocketStatus.Disconnected
  );

  const validateToken = (token: string): boolean => {
    const { isValid, error } = decodeAndValidateToken(token);

    if (!isValid && error) {
      logInfo("Token validation failed:", error);
    }

    return isValid;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setConnectionStatus(WebSocketStatus.Disconnected);
      return;
    }

    let isCancelled = false;
    shouldStopRetrying.current = false;

    const mainServiceWsBaseUrl = getWSBaseURL();

    const fetchAndSubscribe = async () => {
      if (shouldStopRetrying.current || isCancelled) {
        logInfo("Stopping WebSocket connection attempts due to authentication failure");
        setConnectionStatus(WebSocketStatus.Disconnected);
        return;
      }

      try {
        setConnectionStatus(WebSocketStatus.Connecting);

        const { idToken, workspace } = await getAllTokens();

        if (workspace == null) {
          setTimeout(fetchAndSubscribe, RETRY_FOR_MISSING_WORKSPACE);
        }

        if (idToken === null) {
          logInfo("aborting web socket connection due to missing token");
          shouldStopRetrying.current = true;
          setConnectionStatus(WebSocketStatus.Error);
          return;
        }

        if (!validateToken(idToken)) {
          logInfo("aborting web socket connection due to invalid or expired token");
          shouldStopRetrying.current = true;
          setConnectionStatus(WebSocketStatus.Error);
          return;
        }

        const wsUrl = `${mainServiceWsBaseUrl}/ws-message-subscription`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // Send CONNECT frame
          const connectFrameBytes = [
            ...Array.from(new TextEncoder().encode("CONNECT\n")),
            ...Array.from(new TextEncoder().encode(`Authorization:Bearer ${idToken}\n`)),
            ...Array.from(new TextEncoder().encode(`Workspace-Id:${workspace}\n`)),
            ...Array.from(new TextEncoder().encode("accept-version:1.2\n")),
            ...Array.from(new TextEncoder().encode("heart-beat:0,0\n")),
            0x0a, // empty line
            0x00, // null terminator
          ];

          const uint8Array = new Uint8Array(connectFrameBytes);
          ws.send(uint8Array.buffer);
        };

        ws.onmessage = (event) => {
          logDebug("Received message:", event.data.substring(0, 100));

          if (event.data.startsWith(CONNECTED_RESPONSE)) {
            logDebug("STOMP Connected successfully");
            setConnectionStatus(WebSocketStatus.Connected);

            // Subscribe to messages
            const subscribeFrameBytes = [
              ...Array.from(new TextEncoder().encode("SUBSCRIBE\n")),
              ...Array.from(
                new TextEncoder().encode(
                  `destination:${MESSAGE_RECEIVED_TOPIC}${encodeURIComponent(email)}\n`
                )
              ),
              ...Array.from(new TextEncoder().encode("id:sub-0\n")),
              0x0a, // empty line
              0x00, // null terminator
            ];

            const subscribeArray = new Uint8Array(subscribeFrameBytes);
            ws.send(subscribeArray.buffer);
            logDebug("Subscribed to messages");
          } else if (event.data.startsWith(ERROR_RESPONSE)) {
            logInfo("STOMP error:", event.data);
            setConnectionStatus(WebSocketStatus.Error);
            const errorMessage = event.data.toLowerCase();
            if (
              errorMessage.includes("unauthorized") ||
              errorMessage.includes("token") ||
              errorMessage.includes("expired") ||
              errorMessage.includes("auth")
            ) {
              logInfo("Authentication error detected, stopping reconnection attempts");
              shouldStopRetrying.current = true;
            }
          } else if (event.data.startsWith(MESSAGE_RESPONSE)) {
            // Parse message body (everything after empty line)
            const lines = event.data.split("\n");
            const emptyLineIndex = lines.findIndex((line: string) => line === "");
            if (emptyLineIndex > -1) {
              const body = lines
                .slice(emptyLineIndex + 1)
                .join("\n")
                .replace(/\0$/, "");

              try {
                const wsMessageWithConversation = JSON.parse(body) as IConversation;
                if (wsMessageWithConversation.messages?.length !== 0) {
                  emitNewMessage(wsMessageWithConversation);
                }
              } catch (error) {
                logInfo("Error parsing message:", error);
              }
            }
          }
        };

        ws.onerror = (error) => {
          logInfo("WebSocket error:", error);
          setConnectionStatus(WebSocketStatus.Error);
        };

        ws.onclose = (event) => {
          logDebug("WebSocket closed:", event.code, event.reason);
          setConnectionStatus(WebSocketStatus.Disconnected);

          // Check if it's an auth failure and stop retrying
          if (event.code === 1002 || event.code === 1008 || event.code === 3401) {
            logInfo("Connection closed due to authentication failure");
            shouldStopRetrying.current = true;
            return; // Exit early - no retry on auth failures
          }

          // Reconnect on all other disconnections (including after errors)
          if (!isCancelled && !shouldStopRetrying.current) {
            logInfo("WebSocket disconnected, attempting reconnection in 10 seconds...");
            setTimeout(fetchAndSubscribe, RETRY_TIME_MS);
          }
        };
      } catch (error) {
        logInfo("Connection setup error:", error);
        setConnectionStatus(WebSocketStatus.Error);
        if (!isCancelled && !shouldStopRetrying.current) {
          setTimeout(fetchAndSubscribe, RETRY_TIME_MS);
        }
      }
    };

    void fetchAndSubscribe();

    return () => {
      isCancelled = true;
      shouldStopRetrying.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnectionStatus(WebSocketStatus.Disconnected);
    };
  }, [email, isAuthenticated]);

  // return the connection status
  return { connectionStatus };
}
