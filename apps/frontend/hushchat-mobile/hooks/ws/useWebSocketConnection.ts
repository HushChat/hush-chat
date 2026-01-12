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
import { TOPICS, WS_URL_PATH } from "@/constants/ws/wsTopics";
import { getDeviceType } from "@/utils/commonUtils";
import {
  DEVICE_ID_KEY,
  HEADER_ACCEPT_VERSION,
  HEADER_AUTHORIZATION,
  HEADER_DEVICE_TYPE,
  HEADER_HEART_BEAT,
  HEADER_WORKSPACE_ID,
} from "@/constants/constants";

import { getDeviceId } from "@/utils/deviceIdUtils";
import { useAppVisibility } from "@/hooks/useAppVisibility";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { HEARTBEAT_INTERVAL, useHeartbeat } from "@/hooks/ws/wsHeartbeat";
import { publishTypingStatus, publishUserActivity } from "@/hooks/ws/wsPublisher";

const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const RETRY_MULTIPLIER = 1.5;
const MAX_RECONNECT_ATTEMPTS = 50;

const CONNECTION_DEBOUNCE_DELAY = 1000;

const encoder = new TextEncoder();

export default function useWebSocketConnection() {
  const { isAuthenticated, isWorkspaceSelected } = useAuthStore();
  const isAppActive = useAppVisibility();
  const isNetworkConnected = useNetworkStatus();
  const {
    user: { email, id },
  } = useUserStore();
  const { startHeartbeat, stopHeartbeat, updateLastMessageTime } = useHeartbeat();

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Connection control flags
  const shouldStopRetryingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isIntentionalCloseRef = useRef(false);
  const isCleaningUpRef = useRef(false);

  // Reconnection state
  const reconnectAttemptsRef = useRef(0);

  // Timer references
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track previous visibility/network states
  const prevAppActiveRef = useRef<boolean>(isAppActive);
  const prevNetworkConnectedRef = useRef<boolean>(isNetworkConnected);

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(
    WebSocketStatus.Disconnected
  );

  // Calculate retry delay
  const getRetryDelay = useCallback(() => {
    const baseDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(RETRY_MULTIPLIER, reconnectAttemptsRef.current),
      MAX_RETRY_DELAY
    );
    const jitter = Math.random() * baseDelay * 0.2;
    return Math.floor(baseDelay + jitter);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (connectionDebounceRef.current) {
      clearTimeout(connectionDebounceRef.current);
      connectionDebounceRef.current = null;
    }
  }, []);

  const closeExistingConnection = useCallback(() => {
    if (wsRef.current) {
      isIntentionalCloseRef.current = true;
      stopHeartbeat();
      try {
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close(1000, "Closing for reconnection");
        }
      } catch (error) {
        logDebug("Error closing existing connection:", error);
      }
      wsRef.current = null;
    }
  }, [stopHeartbeat]);

  // Check if we can attempt connection
  const canAttemptConnection = useCallback(() => {
    if (isCleaningUpRef.current) {
      logDebug("Cannot connect: cleanup in progress");
      return false;
    }
    if (shouldStopRetryingRef.current) {
      logDebug("Cannot connect: shouldStopRetrying is true");
      return false;
    }
    if (!isAuthenticated || !isWorkspaceSelected) {
      logDebug("Cannot connect: not authenticated or workspace not selected");
      return false;
    }
    if (isConnectingRef.current) {
      logDebug("Cannot connect: connection already in progress");
      return false;
    }
    return true;
  }, [isAuthenticated, isWorkspaceSelected]);

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

      const wsUrl = `${getWSBaseURL()}${WS_URL_PATH}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isIntentionalCloseRef.current = false;

      ws.onopen = () => {
        logInfo("WebSocket connection opened");
        updateLastMessageTime();

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
        updateLastMessageTime();
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
          stopHeartbeat();

          const errorMessage = event.data.toLowerCase();
          if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("token") ||
            errorMessage.includes("expired") ||
            errorMessage.includes("auth")
          ) {
            logInfo("Authentication error detected, stopping reconnection attempts");
            shouldStopRetryingRef.current = true;
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
        stopHeartbeat();
      };

      ws.onclose = (event) => {
        logInfo("WebSocket closed:", event.code, event.reason);
        setConnectionStatus(WebSocketStatus.Disconnected);
        stopHeartbeat();
        isConnectingRef.current = false;

        if (isIntentionalCloseRef.current || isCleaningUpRef.current) {
          logInfo("WebSocket closed intentionally, not reconnecting");
          return;
        }

        // Check for authentication failures - stop all retries
        if (event.code === 1002 || event.code === 1008 || event.code === 3401) {
          logInfo("Connection closed due to authentication failure, stopping all retries");
          shouldStopRetryingRef.current = true;
          return;
        }

        // Attempt reconnection
        if (!shouldStopRetryingRef.current && isAuthenticated && !isCleaningUpRef.current) {
          reconnectAttemptsRef.current++;

          if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
            logInfo("Max reconnection attempts reached, stopping");
            shouldStopRetryingRef.current = true;
            setConnectionStatus(WebSocketStatus.Error);
            return;
          }

          const retryDelay = getRetryDelay();
          logInfo(
            `Attempting reconnection ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${retryDelay}ms...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isCleaningUpRef.current && !shouldStopRetryingRef.current) {
              connectWebSocket();
            }
          }, retryDelay);
        }
      };
    } catch (error) {
      logInfo("Connection setup error:", error);
      setConnectionStatus(WebSocketStatus.Error);
      isConnectingRef.current = false;
      stopHeartbeat();

      if (!shouldStopRetryingRef.current && isAuthenticated && !isCleaningUpRef.current) {
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
          const retryDelay = getRetryDelay();
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isCleaningUpRef.current && !shouldStopRetryingRef.current) {
              connectWebSocket();
            }
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
    updateLastMessageTime,
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
    if (shouldStopRetryingRef.current || isCleaningUpRef.current) {
      logDebug("Skipping visibility reconnect: shouldStopRetrying is true");
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
        if (!shouldStopRetryingRef.current && isAuthenticated && !isCleaningUpRef.current) {
          reconnectAttemptsRef.current = 0;
          connectWebSocket();
        }
      }, CONNECTION_DEBOUNCE_DELAY);
    }
  }, [isAppActive, isAuthenticated, connectionStatus, connectWebSocket]);

  // Handle online/offline
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
        stopHeartbeat();
        try {
          if (
            wsRef.current.readyState === WebSocket.OPEN ||
            wsRef.current.readyState === WebSocket.CONNECTING
          ) {
            wsRef.current.close(1000, "Network lost");
          }
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

      if (shouldStopRetryingRef.current || isCleaningUpRef.current) {
        logDebug("Skipping network reconnect: shouldStopRetrying is true");
        return;
      }

      logInfo("Network connection restored, reconnecting WebSocket");

      if (connectionDebounceRef.current) {
        clearTimeout(connectionDebounceRef.current);
      }

      connectionDebounceRef.current = setTimeout(() => {
        if (!shouldStopRetryingRef.current && isAuthenticated && !isCleaningUpRef.current) {
          reconnectAttemptsRef.current = 0;
          isConnectingRef.current = false;
          connectWebSocket();
        }
      }, CONNECTION_DEBOUNCE_DELAY);
    }
  }, [isNetworkConnected, isAuthenticated, connectWebSocket, stopHeartbeat]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnectionStatus(WebSocketStatus.Disconnected);
      shouldStopRetryingRef.current = true;
      isConnectingRef.current = false;
      isCleaningUpRef.current = true;
      clearAllTimers();
      closeExistingConnection();
      isCleaningUpRef.current = false;
      return;
    }

    // Reset state for new authentication
    shouldStopRetryingRef.current = false;
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    isCleaningUpRef.current = false;
    connectWebSocket();

    return () => {
      isCleaningUpRef.current = true;
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
        logInfo("Cannot publish activity: WebSocket not connected", {
          status: connectionStatus,
        });
        return false;
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        logInfo("Cannot publish activity: WebSocket not in OPEN state");
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
        logInfo("Cannot publish typing: WebSocket not connected", {
          status: connectionStatus,
        });
        return false;
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        logInfo("Cannot publish typing: WebSocket not in OPEN state");
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

  return {
    connectionStatus,
    publishActivity,
    publishTyping,
  };
}
