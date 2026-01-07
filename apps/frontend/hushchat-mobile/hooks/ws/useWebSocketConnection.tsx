import { useAuthStore } from "@/store/auth/authStore";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { getAllTokens } from "@/utils/authUtils";
import { getWSBaseURL } from "@/utils/apiUtils";
import {
  CONNECTED_RESPONSE,
  ERROR_RESPONSE,
  MESSAGE_RESPONSE,
  RETRY_TIME_MS,
} from "@/constants/wsConstants";
import {
  TypingIndicatorWSData,
  UserActivityWSSubscriptionData,
  WebSocketStatus,
} from "@/types/ws/types";
import { logDebug, logInfo } from "@/utils/logger";
import { extractTopicFromMessage, subscribeToTopic, validateToken } from "@/hooks/ws/WSUtilService";
import { handleMessageByTopic } from "@/hooks/ws/wsTopicHandlers";
import { WS_TOPICS } from "@/constants/ws/wsTopics";
import { getDeviceType } from "@/utils/commonUtils";
import {
  DEVICE_ID_KEY,
  HEADER_ACCEPT_VERSION,
  HEADER_AUTHORIZATION,
  HEADER_CONTENT_LENGTH,
  HEADER_CONTENT_TYPE,
  HEADER_DESTINATION,
  HEADER_DEVICE_TYPE,
  HEADER_HEART_BEAT,
  HEADER_WORKSPACE_ID,
  TITLES,
} from "@/constants/constants";

import { getDeviceId } from "@/utils/deviceIdUtils";
import { WS_DESTINATIONS } from "@/constants/apiConstants";

// Define topics to subscribe to
const TOPICS = [
  { destination: WS_TOPICS.message.received, id: "sub-message-received" },
  { destination: WS_TOPICS.user.onlineStatus, id: "sub-online-status" },
  { destination: WS_TOPICS.conversation.created, id: "sub-conversation-created" },
  { destination: WS_TOPICS.message.unsent, id: "sub-message-unsent" },
  { destination: WS_TOPICS.message.react, id: "sub-message-reaction" },
  { destination: WS_TOPICS.message.typing, id: "sub-typing-status" },
  { destination: WS_TOPICS.message.read, id: "sub-message-read" },
] as const;

const encoder = new TextEncoder();

// check if WebSocket can publish
const canPublish = (ws: WebSocket | null, action: string): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    logInfo(`WebSocket not connected, cannot publish ${action}`);
    return false;
  }
  return true;
};

// build STOMP SEND frames
const buildStompSendFrame = (
  destination: string,
  body: string,
  deviceType: string,
  deviceId: string
): Uint8Array => {
  const sendFrameBytes = [
    ...Array.from(encoder.encode("SEND\n")),
    ...Array.from(encoder.encode(`${HEADER_DESTINATION}:${destination}\n`)),
    ...Array.from(encoder.encode(`${DEVICE_ID_KEY}:${deviceId}\n`)),
    ...Array.from(encoder.encode(`${HEADER_DEVICE_TYPE}:${deviceType}\n`)),
    ...Array.from(encoder.encode(`${HEADER_CONTENT_LENGTH}:${body.length}\n`)),
    ...Array.from(
      encoder.encode(`${HEADER_CONTENT_TYPE}:application/json
`)
    ),
    0x0a, // empty line
    ...Array.from(encoder.encode(body)),
    0x00, // null terminator
  ];

  return new Uint8Array(sendFrameBytes);
};

// Generic publish function
const publishToWebSocket = (
  ws: WebSocket | null,
  destination: string,
  data: UserActivityWSSubscriptionData | TypingIndicatorWSData,
  action: string
): boolean => {
  if (!canPublish(ws, action)) {
    return false;
  }

  try {
    const body = JSON.stringify(data);
    const deviceType = (data as any).deviceType ?? getDeviceType();
    const deviceId = (data as any).deviceId ?? getDeviceId();
    const frame = buildStompSendFrame(destination, body, deviceType, deviceId);
    ws.send(frame.buffer);
    return true;
  } catch (error) {
    logInfo(`Error publishing ${action}:`, error);
    return false;
  }
};

export const publishUserActivity = (
  ws: WebSocket | null,
  data: UserActivityWSSubscriptionData
): boolean => {
  return publishToWebSocket(
    ws,
    WS_DESTINATIONS.SUBSCRIBED_CONVERSATIONS,
    data,
    TITLES.USER_ACTIVITY
  );
};

export const publishTypingStatus = (ws: WebSocket | null, data: TypingIndicatorWSData): boolean => {
  return publishToWebSocket(ws, WS_DESTINATIONS.TYPING, data, TITLES.TYPING_ACTIVITY);
};

export default function useWebSocketConnection() {
  const { isAuthenticated } = useAuthStore();
  const {
    user: { email, id },
  } = useUserStore();
  const wsRef = useRef<WebSocket | null>(null);
  const shouldStopRetrying = useRef(false);

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(
    WebSocketStatus.Disconnected
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setConnectionStatus(WebSocketStatus.Disconnected);
      return;
    }

    let isCancelled = false;
    shouldStopRetrying.current = false;

    const mainServiceWsBaseUrl = getWSBaseURL();

    const deviceType = getDeviceType();

    const fetchAndSubscribe = async () => {
      if (shouldStopRetrying.current || isCancelled) {
        logInfo("Stopping WebSocket connection attempts due to authentication failure");
        setConnectionStatus(WebSocketStatus.Disconnected);
        return;
      }

      try {
        setConnectionStatus(WebSocketStatus.Connecting);

        const { idToken, workspace } = await getAllTokens();
        const deviceId = await getDeviceId();

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

        if (deviceId === null) {
          logInfo("aborting web socket connection due to missing device ID");
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
            ...Array.from(encoder.encode("CONNECT\n")),
            ...Array.from(encoder.encode(`${HEADER_AUTHORIZATION}:Bearer ${idToken}\n`)),
            ...Array.from(encoder.encode(`${HEADER_WORKSPACE_ID}:${workspace}\n`)),
            ...Array.from(encoder.encode(`${DEVICE_ID_KEY}:${deviceId}\n`)),
            ...Array.from(encoder.encode(`${HEADER_DEVICE_TYPE}:${deviceType}\n`)),
            ...Array.from(encoder.encode(`${HEADER_ACCEPT_VERSION}:1.2\n`)),
            ...Array.from(encoder.encode(`${HEADER_HEART_BEAT}:0,0\n`)),
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

            // Subscribe to all topics
            TOPICS.forEach((topic) => {
              subscribeToTopic(ws, topic.destination, topic.id, deviceType);
            });
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
            const topic = extractTopicFromMessage(event.data);

            if (emptyLineIndex > -1 && topic) {
              const body = lines
                .slice(emptyLineIndex + 1)
                .join("\n")
                .replace(/\0$/, "");

              // Route message to appropriate handler based on topic
              handleMessageByTopic(topic, body);
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

  const publishActivity = async (data: UserActivityWSSubscriptionData) => {
    if (connectionStatus !== WebSocketStatus.Connected) {
      logInfo("Cannot publish activity: WebSocket not connected", {
        status: connectionStatus,
      });
      return false;
    }

    const deviceType = getDeviceType();
    const deviceId = await getDeviceId();
    return publishUserActivity(wsRef.current, { ...data, deviceType, deviceId });
  };

  const publishTyping = async (data: TypingIndicatorWSData) => {
    if (connectionStatus !== WebSocketStatus.Connected) {
      logInfo("Cannot publish typing: WebSocket not connected", {
        status: connectionStatus,
      });
      return false;
    }

    const userId = id;

    if (!userId) {
      logInfo("Cannot publish typing: missing workspaceId or userId");
      return false;
    }

    return publishTypingStatus(wsRef.current, {
      ...data,
      userId,
    });
  };

  // return the connection status
  return { connectionStatus, publishActivity, publishTyping };
}
