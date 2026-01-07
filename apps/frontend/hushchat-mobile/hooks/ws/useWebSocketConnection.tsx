import { useAuthStore } from "@/store/auth/authStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { getAllTokens } from "@/utils/authUtils";
import { getWSBaseURL } from "@/utils/apiUtils";
import { CONNECTED_RESPONSE, ERROR_RESPONSE, MESSAGE_RESPONSE } from "@/constants/wsConstants";
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
import { useAppVisibility } from "@/hooks/useAppVisibility";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

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

// All time constants in milliseconds
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const RETRY_MULTIPLIER = 1.5;
const MAX_RECONNECT_ATTEMPTS = 50;

const HEARTBEAT_INTERVAL = 30000;
const MISSED_HEARTBEAT_THRESHOLD = 2;

// Debounce delay for connection attempts triggered by visibility/network changes
const CONNECTION_DEBOUNCE_DELAY = 500;

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
    ...Array.from(encoder.encode(`${HEADER_CONTENT_TYPE}:application/json\n`)),
    0x0a,
    ...Array.from(encoder.encode(body)),
    0x00,
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
    ws!.send(buildStompSendFrame(destination, body, deviceType, deviceId).buffer);
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
  const isAppActive = useAppVisibility();
  const isNetworkConnected = useNetworkStatus();
  const {
    user: { email, id },
  } = useUserStore();

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Connection control flags
  const shouldStopRetryingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isIntentionalCloseRef = useRef(false);

  // Reconnection state
  const reconnectAttemptsRef = useRef(0);

  // Timer references
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Heartbeat tracking
  const lastMessageTimeRef = useRef<number>(Date.now());

  // Track previous visibility/network state to avoid duplicate triggers
  const prevAppActiveRef = useRef<boolean>(isAppActive);
  const prevNetworkConnectedRef = useRef<boolean>(isNetworkConnected);

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(
    WebSocketStatus.Disconnected
  );

  // Calculate retry delay with jitter to prevent thundering herd
  const getRetryDelay = useCallback(() => {
    const baseDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(RETRY_MULTIPLIER, reconnectAttemptsRef.current),
      MAX_RETRY_DELAY
    );
    const jitter = Math.random() * baseDelay * 0.2;
    return Math.floor(baseDelay + jitter);
  }, []);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    if (connectionDebounceRef.current) {
      clearTimeout(connectionDebounceRef.current);
      connectionDebounceRef.current = null;
    }
  }, []);

  // Stop heartbeat mechanism
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

  // Send heartbeat ping
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
          ...Array.from(encoder.encode(`${HEADER_DESTINATION}: /app/heartbeat\n`)),
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

  // Start heartbeat mechanism
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

  // Close existing WebSocket connection
  const closeExistingConnection = useCallback(() => {
    if (wsRef.current) {
      isIntentionalCloseRef.current = true;
      try {
        wsRef.current.close(1000, "Closing for reconnection");
      } catch (error) {
        logDebug("Error closing existing connection:", error);
      }
      wsRef.current = null;
    }
  }, []);

  // Check if we can attempt connection
  const canAttemptConnection = useCallback(() => {
    if (shouldStopRetryingRef.current) {
      logDebug("Cannot connect:  shouldStopRetrying is true");
      return false;
    }
    if (!isAuthenticated) {
      logDebug("Cannot connect: not authenticated");
      return false;
    }
    if (isConnectingRef.current) {
      logDebug("Cannot connect: connection already in progress");
      return false;
    }
    return true;
  }, [isAuthenticated]);

  // Main connection function
  const connectWebSocket = useCallback(async () => {
    if (!canAttemptConnection()) {
      return;
    }

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Check if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      logDebug("WebSocket already connected, skipping connection attempt");
      return;
    }

    isConnectingRef.current = true;

    // Close existing connection if any
    closeExistingConnection();

    try {
      setConnectionStatus(WebSocketStatus.Connecting);

      const { idToken, workspace } = await getAllTokens();
      const deviceId = await getDeviceId();
      const deviceType = getDeviceType();

      if (idToken === null) {
        logInfo("Aborting WebSocket connection due to missing token");
        shouldStopRetryingRef.current = true;
        setConnectionStatus(WebSocketStatus.Error);
        isConnectingRef.current = false;
        return;
      }

      if (!validateToken(idToken)) {
        logInfo("Aborting WebSocket connection due to invalid or expired token");
        shouldStopRetryingRef.current = true;
        setConnectionStatus(WebSocketStatus.Error);
        isConnectingRef.current = false;
        return;
      }

      if (deviceId === null) {
        logInfo("Aborting WebSocket connection due to missing device ID");
        shouldStopRetryingRef.current = true;
        setConnectionStatus(WebSocketStatus.Error);
        isConnectingRef.current = false;
        return;
      }

      const wsUrl = `${getWSBaseURL()}/ws-message-subscription`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isIntentionalCloseRef.current = false;

      ws.onopen = () => {
        logInfo("WebSocket connection opened");
        lastMessageTimeRef.current = Date.now();

        // FIXED: No space after colon in heart-beat header
        const connectFrameBytes = [
          ...Array.from(encoder.encode("CONNECT\n")),
          ...Array.from(encoder.encode(`${HEADER_AUTHORIZATION}:Bearer ${idToken}\n`)),
          ...Array.from(encoder.encode(`${HEADER_WORKSPACE_ID}:${workspace}\n`)),
          ...Array.from(encoder.encode(`${DEVICE_ID_KEY}:${deviceId}\n`)),
          ...Array.from(encoder.encode(`${HEADER_DEVICE_TYPE}:${deviceType}\n`)),
          ...Array.from(encoder.encode(`${HEADER_ACCEPT_VERSION}:1.2\n`)),
          ...Array.from(
            encoder.encode(`${HEADER_HEART_BEAT}:${HEARTBEAT_INTERVAL},${HEARTBEAT_INTERVAL}\n`)
          ),
          0x0a,
          0x00,
        ];

        const uint8Array = new Uint8Array(connectFrameBytes);
        ws.send(uint8Array.buffer);
      };

      ws.onmessage = (event) => {
        lastMessageTimeRef.current = Date.now();
        logDebug("Received message:", event.data.substring(0, 100));

        if (event.data.startsWith(CONNECTED_RESPONSE)) {
          logInfo("STOMP Connected successfully");
          setConnectionStatus(WebSocketStatus.Connected);
          reconnectAttemptsRef.current = 0;
          isConnectingRef.current = false;

          // Subscribe to all topics first
          TOPICS.forEach((topic) => {
            subscribeToTopic(ws, topic.destination, topic.id, deviceType);
          });

          // Start heartbeat after subscriptions
          startHeartbeat(ws);
        } else if (event.data.startsWith(ERROR_RESPONSE)) {
          logInfo("STOMP error:", event.data);
          setConnectionStatus(WebSocketStatus.Error);
          isConnectingRef.current = false;

          const errorMessage = event.data.toLowerCase();
          if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("token") ||
            errorMessage.includes("expired") ||
            errorMessage.includes("auth")
          ) {
            logInfo("Authentication error detected, stopping reconnection attempts");
            shouldStopRetryingRef.current = true;
            stopHeartbeat();
          }
        } else if (event.data.startsWith(MESSAGE_RESPONSE)) {
          const lines = event.data.split("\n");
          const emptyLineIndex = lines.findIndex((line: string) => line === "");
          const topic = extractTopicFromMessage(event.data);

          if (emptyLineIndex > -1 && topic) {
            const body = lines
              .slice(emptyLineIndex + 1)
              .join("\n")
              .replace(/\0$/, "");

            handleMessageByTopic(topic, body);
          }
        }
      };

      ws.onerror = (error) => {
        logInfo("WebSocket error:", error);
        setConnectionStatus(WebSocketStatus.Error);
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        logInfo("WebSocket closed:", event.code, event.reason);
        setConnectionStatus(WebSocketStatus.Disconnected);
        stopHeartbeat();
        isConnectingRef.current = false;

        // Don't reconnect if it was an intentional close
        if (isIntentionalCloseRef.current) {
          logInfo("WebSocket closed intentionally, not reconnecting");
          return;
        }

        // Check for authentication failures - stop all retries
        if (event.code === 1002 || event.code === 1008 || event.code === 3401) {
          logInfo("Connection closed due to authentication failure, stopping all retries");
          shouldStopRetryingRef.current = true;
          return;
        }

        // Attempt reconnection with exponential backoff
        if (!shouldStopRetryingRef.current && isAuthenticated) {
          reconnectAttemptsRef.current++;

          if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
            logInfo("Max reconnection attempts reached, stopping");
            shouldStopRetryingRef.current = true;
            setConnectionStatus(WebSocketStatus.Error);
            return;
          }

          const retryDelay = getRetryDelay();
          logInfo(
            `Attempting reconnection ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${retryDelay}ms... `
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, retryDelay);
        }
      };
    } catch (error) {
      logInfo("Connection setup error:", error);
      setConnectionStatus(WebSocketStatus.Error);
      isConnectingRef.current = false;

      if (!shouldStopRetryingRef.current && isAuthenticated) {
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
          const retryDelay = getRetryDelay();
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, retryDelay);
        } else {
          shouldStopRetryingRef.current = true;
          setConnectionStatus(WebSocketStatus.Error);
        }
      }
    }
  }, [
    isAuthenticated,
    canAttemptConnection,
    startHeartbeat,
    stopHeartbeat,
    closeExistingConnection,
    getRetryDelay,
  ]);

  // Handle page visibility changes
  useEffect(() => {
    // Only trigger on actual state change from inactive to active
    const wasInactive = !prevAppActiveRef.current;
    const isNowActive = isAppActive;
    prevAppActiveRef.current = isAppActive;

    if (!wasInactive || !isNowActive) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    // Don't reconnect if we stopped retrying (auth failure)
    if (shouldStopRetryingRef.current) {
      logDebug("Skipping visibility reconnect:  shouldStopRetrying is true");
      return;
    }

    const needsReconnection = !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN;

    if (needsReconnection && connectionStatus !== WebSocketStatus.Connecting) {
      logInfo("Reconnecting WebSocket after page became visible");

      // Clear any existing debounce
      if (connectionDebounceRef.current) {
        clearTimeout(connectionDebounceRef.current);
      }

      connectionDebounceRef.current = setTimeout(() => {
        if (!shouldStopRetryingRef.current && isAuthenticated) {
          reconnectAttemptsRef.current = 0;
          connectWebSocket();
        }
      }, CONNECTION_DEBOUNCE_DELAY);
    }
  }, [isAppActive, isAuthenticated, connectionStatus, connectWebSocket]);

  // Handle online/offline events
  useEffect(() => {
    const wasOffline = !prevNetworkConnectedRef.current;
    const isNowOnline = isNetworkConnected;
    prevNetworkConnectedRef.current = isNetworkConnected;

    if (!isNowOnline) {
      logInfo("Network connection lost");
      setConnectionStatus(WebSocketStatus.Disconnected);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (connectionDebounceRef.current) {
        clearTimeout(connectionDebounceRef.current);
        connectionDebounceRef.current = null;
      }

      if (wsRef.current) {
        isIntentionalCloseRef.current = true;
        try {
          wsRef.current.close(1000, "Network lost");
        } catch (error) {
          logDebug("Error closing connection on network loss:", error);
        }
        wsRef.current = null;
      }

      isConnectingRef.current = false;

      return;
    }

    if (isNowOnline && wasOffline) {
      if (!isAuthenticated) {
        return;
      }

      if (shouldStopRetryingRef.current) {
        logDebug("Skipping network reconnect:  shouldStopRetrying is true");
        return;
      }

      logInfo("Network connection restored, reconnecting WebSocket");

      if (connectionDebounceRef.current) {
        clearTimeout(connectionDebounceRef.current);
      }

      connectionDebounceRef.current = setTimeout(() => {
        if (!shouldStopRetryingRef.current && isAuthenticated) {
          reconnectAttemptsRef.current = 0;
          isConnectingRef.current = false;
          connectWebSocket();
        }
      }, CONNECTION_DEBOUNCE_DELAY);
    }
  }, [isNetworkConnected, isAuthenticated, connectWebSocket]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnectionStatus(WebSocketStatus.Disconnected);
      shouldStopRetryingRef.current = true;
      isConnectingRef.current = false;
      clearAllTimers();
      closeExistingConnection();
      return;
    }

    // Reset state for new authentication
    shouldStopRetryingRef.current = false;
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    connectWebSocket();

    return () => {
      shouldStopRetryingRef.current = true;
      isConnectingRef.current = false;
      clearAllTimers();
      closeExistingConnection();
      setConnectionStatus(WebSocketStatus.Disconnected);
    };
  }, [email, isAuthenticated, connectWebSocket, clearAllTimers, closeExistingConnection]);

  // Publish user activity
  const publishActivity = useCallback(
    async (data: UserActivityWSSubscriptionData) => {
      if (connectionStatus !== WebSocketStatus.Connected) {
        logInfo("Cannot publish activity:  WebSocket not connected", {
          status: connectionStatus,
        });
        return false;
      }

      const deviceType = getDeviceType();
      const deviceId = await getDeviceId();
      return publishUserActivity(wsRef.current, { ...data, deviceType, deviceId });
    },
    [connectionStatus]
  );

  // Publish typing status
  const publishTyping = useCallback(
    async (data: TypingIndicatorWSData) => {
      if (connectionStatus !== WebSocketStatus.Connected) {
        logInfo("Cannot publish typing:  WebSocket not connected", {
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
    },
    [connectionStatus, id]
  );

  // Manual reconnect - resets shouldStopRetrying
  const reconnect = useCallback(() => {
    logInfo("Manual reconnection triggered");
    shouldStopRetryingRef.current = false;
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    clearAllTimers();
    closeExistingConnection();

    setTimeout(() => {
      connectWebSocket();
    }, 100);
  }, [connectWebSocket, clearAllTimers, closeExistingConnection]);

  return {
    connectionStatus,
    publishActivity,
    publishTyping,
    reconnect,
  };
}
