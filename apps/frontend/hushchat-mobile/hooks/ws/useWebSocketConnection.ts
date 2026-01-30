import { useAuthStore } from "@/store/auth/authStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { getAllTokens, refreshIdToken } from "@/utils/authUtils";
import { getWSBaseURL } from "@/utils/apiUtils";
import { CONNECTED_RESPONSE, ERROR_RESPONSE, MESSAGE_RESPONSE } from "@/constants/wsConstants";
import {
  ConnectionState,
  initialConnectionState,
  TypingIndicatorWSData,
  UserActivityWSSubscriptionData,
  WebSocketStatus,
} from "@/types/ws/types";
import { logDebug, logError, logInfo } from "@/utils/logger";
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
import { CONFIG } from "@/constants/ws/wsConfig";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

const encoder = new TextEncoder();

export default function useWebSocketConnection() {
  const { isAuthenticated, isWorkspaceSelected } = useAuthStore();
  const isAppActive = useAppVisibility();
  const isNetworkConnected = useNetworkStatus();
  const {
    user: { id },
  } = useUserStore();
  const { startHeartbeat, stopHeartbeat, updateLastMessageTime } = useHeartbeat();
  const isMobileLayout = useIsMobileLayout();

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Connection state ref (using ref to avoid stale closures)
  const stateRef = useRef<ConnectionState>({ ...initialConnectionState });

  // Timer references
  const timersRef = useRef<{
    reconnect: ReturnType<typeof setTimeout> | null;
    connectionTimeout: ReturnType<typeof setTimeout> | null;
    connectionDebounce: ReturnType<typeof setTimeout> | null;
    healthCheck: ReturnType<typeof setInterval> | null;
  }>({
    reconnect: null,
    connectionTimeout: null,
    connectionDebounce: null,
    healthCheck: null,
  });

  // Track previous visibility/network states
  const prevAppActiveRef = useRef<boolean>(isAppActive);
  const prevNetworkConnectedRef = useRef<boolean>(isNetworkConnected);

  // Current workspace ID for reconnection detection
  const currentWorkspaceRef = useRef<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(
    WebSocketStatus.Disconnected
  );

  // Update state helper
  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    stateRef.current = { ...stateRef.current, ...updates };
    if (updates.status !== undefined) {
      setConnectionStatus(updates.status);
    }
  }, []);

  const getRetryDelay = useCallback(() => {
    const attempts = stateRef.current.reconnectAttempts;
    const baseDelay = Math.min(
      CONFIG.INITIAL_RETRY_DELAY * Math.pow(CONFIG.RETRY_MULTIPLIER, attempts),
      CONFIG.MAX_RETRY_DELAY
    );

    if (baseDelay >= CONFIG.MAX_RETRY_DELAY) {
      logInfo("Retry delay capped at maximum");
    }

    // Add jitter
    const jitter = Math.random() * baseDelay * 0.2;
    return Math.floor(baseDelay + jitter);
  }, []);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    const timers = timersRef.current;

    if (timers.reconnect) {
      clearTimeout(timers.reconnect);
      timers.reconnect = null;
    }
    if (timers.connectionTimeout) {
      clearTimeout(timers.connectionTimeout);
      timers.connectionTimeout = null;
    }
    if (timers.connectionDebounce) {
      clearTimeout(timers.connectionDebounce);
      timers.connectionDebounce = null;
    }
    if (timers.healthCheck) {
      clearInterval(timers.healthCheck);
      timers.healthCheck = null;
    }
  }, []);

  // Clean up WebSocket event handlers
  const cleanupWebSocketHandlers = useCallback((ws: WebSocket | null) => {
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    }
  }, []);

  // Close existing connection
  const closeExistingConnection = useCallback(
    (reason: string = "Closing connection") => {
      const ws = wsRef.current;
      if (ws) {
        updateState({ isIntentionalClose: true });
        stopHeartbeat();
        cleanupWebSocketHandlers(ws);

        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(1000, reason);
          }
        } catch (error) {
          logDebug("Error closing existing connection:", error);
        }
        wsRef.current = null;
      }
    },
    [stopHeartbeat, cleanupWebSocketHandlers, updateState]
  );

  // Store connect function in ref to avoid stale closures in callbacks
  const connectWebSocketRef = useRef<(() => Promise<void>) | null>(null);

  // Health check function
  const startHealthCheck = useCallback(() => {
    if (timersRef.current.healthCheck) {
      clearInterval(timersRef.current.healthCheck);
    }

    timersRef.current.healthCheck = setInterval(() => {
      const state = stateRef.current;
      const ws = wsRef.current;

      if (ws?.readyState === WebSocket.OPEN) {
        const timeSinceLastMessage = Date.now() - state.lastMessageTime;

        if (timeSinceLastMessage > CONFIG.STALE_CONNECTION_THRESHOLD) {
          logInfo("Connection appears stale, reconnecting...");
          closeExistingConnection("Stale connection");
          updateState({ reconnectAttempts: 0, isConnecting: false });

          // Trigger reconnection
          timersRef.current.reconnect = setTimeout(() => {
            if (!stateRef.current.isCleaningUp && !stateRef.current.shouldStopRetrying) {
              connectWebSocketRef.current?.();
            }
          }, CONFIG.CONNECTION_DEBOUNCE_DELAY);
        }
      }
    }, CONFIG.HEALTH_CHECK_INTERVAL);
  }, [closeExistingConnection, updateState]);

  // Check if we can attempt connection
  const canAttemptConnection = useCallback(() => {
    const state = stateRef.current;

    if (state.isCleaningUp) {
      logDebug("Cannot connect:  cleanup in progress");
      return false;
    }
    if (state.shouldStopRetrying) {
      logDebug("Cannot connect:  shouldStopRetrying is true");
      return false;
    }
    if (!isAuthenticated || !isWorkspaceSelected) {
      logDebug("Cannot connect: not authenticated or workspace not selected");
      return false;
    }
    if (state.isConnecting) {
      logDebug("Cannot connect: connection already in progress");
      return false;
    }
    return true;
  }, [isAuthenticated, isWorkspaceSelected]);

  // Schedule reconnection with backoff
  const scheduleReconnect = useCallback(() => {
    const state = stateRef.current;

    if (state.shouldStopRetrying || !isAuthenticated || state.isCleaningUp) {
      return;
    }

    const newAttempts = state.reconnectAttempts + 1;
    updateState({ reconnectAttempts: newAttempts });

    if (newAttempts > CONFIG.MAX_RECONNECT_ATTEMPTS) {
      logInfo("Max reconnection attempts reached, stopping");
      updateState({ shouldStopRetrying: true, status: WebSocketStatus.Error });
      return;
    }

    const retryDelay = getRetryDelay();
    logInfo(
      `Attempting reconnection ${newAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS} in ${retryDelay}ms... `
    );

    timersRef.current.reconnect = setTimeout(() => {
      if (!stateRef.current.isCleaningUp && !stateRef.current.shouldStopRetrying) {
        connectWebSocketRef.current?.();
      }
    }, retryDelay);
  }, [isAuthenticated, getRetryDelay, updateState]);

  // Main connection function
  const connectWebSocket = useCallback(async () => {
    if (!canAttemptConnection()) {
      return;
    }

    // Clear any pending reconnect timeout
    if (timersRef.current.reconnect) {
      clearTimeout(timersRef.current.reconnect);
      timersRef.current.reconnect = null;
    }

    // Check if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      logDebug("WebSocket already connected, skipping connection attempt");
      return;
    }

    updateState({ isConnecting: true });

    // Close existing connection first, then reset intentional close flag
    closeExistingConnection("Reconnection");

    try {
      updateState({ status: WebSocketStatus.Connecting });

      const { idToken, workspace } = await getAllTokens();
      const deviceId = await getDeviceId();
      const deviceType = getDeviceType(isMobileLayout);

      // Validate required data
      if (!idToken) {
        logInfo("Aborting WebSocket connection due to missing token");
        updateState({
          shouldStopRetrying: true,
          status: WebSocketStatus.Error,
          isConnecting: false,
        });
        return;
      }

      if (!validateToken(idToken)) {
        logInfo("Aborting WebSocket connection due to invalid or expired token");
        updateState({
          shouldStopRetrying: false,
          status: WebSocketStatus.Error,
          isConnecting: false,
        });
        try {
          await refreshIdToken();
        } catch {
          logInfo("Token refresh failed during WebSocket connection attempt");
        }
        scheduleReconnect();
        return;
      }

      if (!deviceId) {
        logInfo("Aborting WebSocket connection due to missing device ID");
        updateState({
          shouldStopRetrying: true,
          status: WebSocketStatus.Error,
          isConnecting: false,
        });
        return;
      }

      currentWorkspaceRef.current = workspace;

      const wsUrl = `${getWSBaseURL()}${WS_URL_PATH}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      updateState({ isIntentionalClose: false });

      // Set connection timeout
      timersRef.current.connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          logInfo("Connection timeout, closing.. .");
          cleanupWebSocketHandlers(ws);
          ws.close();
          updateState({ isConnecting: false });

          // Attempt retry
          scheduleReconnect();
        }
      }, CONFIG.CONNECTION_TIMEOUT);

      ws.onopen = () => {
        // Clear connection timeout
        if (timersRef.current.connectionTimeout) {
          clearTimeout(timersRef.current.connectionTimeout);
          timersRef.current.connectionTimeout = null;
        }

        logInfo("WebSocket connection opened");
        updateState({ lastMessageTime: Date.now() });
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
        updateState({ lastMessageTime: Date.now() });
        updateLastMessageTime();
        logDebug("Received message:", event.data.substring(0, 100));

        if (event.data.startsWith(CONNECTED_RESPONSE)) {
          logInfo("STOMP Connected successfully");
          updateState({
            status: WebSocketStatus.Connected,
            reconnectAttempts: 0,
            isConnecting: false,
          });

          // Subscribe to all topics
          TOPICS.forEach((topic) => {
            subscribeToTopic(ws, topic.destination, topic.id, deviceType);
          });

          // Start heartbeat after subscriptions
          startHeartbeat(ws);

          // Start health check
          startHealthCheck();
        } else if (event.data.startsWith(ERROR_RESPONSE)) {
          logError("STOMP error:", event.data);
          updateState({ status: WebSocketStatus.Error, isConnecting: false });
          stopHeartbeat();

          const errorMessage = event.data.toLowerCase();
          if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("token") ||
            errorMessage.includes("expired") ||
            errorMessage.includes("auth")
          ) {
            logInfo("Authentication error detected, stopping reconnection attempts");
            updateState({ shouldStopRetrying: true });
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
        logError("WebSocket error:", error);
        updateState({ status: WebSocketStatus.Error, isConnecting: false });
        stopHeartbeat();
      };

      ws.onclose = (event) => {
        logInfo("WebSocket closed:", event.code, event.reason);

        // Clear connection timeout if still pending
        if (timersRef.current.connectionTimeout) {
          clearTimeout(timersRef.current.connectionTimeout);
          timersRef.current.connectionTimeout = null;
        }

        updateState({ status: WebSocketStatus.Disconnected, isConnecting: false });
        stopHeartbeat();

        // Stop health check
        if (timersRef.current.healthCheck) {
          clearInterval(timersRef.current.healthCheck);
          timersRef.current.healthCheck = null;
        }

        const state = stateRef.current;

        if (state.isIntentionalClose || state.isCleaningUp) {
          logInfo("WebSocket closed intentionally, not reconnecting");
          return;
        }

        // Check for authentication failures
        if (event.code === 1008 || event.code === 3401) {
          logInfo("Connection closed due to authentication failure, stopping all retries");
          updateState({ shouldStopRetrying: true });
          return;
        }

        if (event.code === 1002) {
          logInfo("Connection closed due to protocol error (missed heartbeats), will reconnect");
        }

        // Attempt reconnection
        scheduleReconnect();
      };
    } catch (error) {
      logError("Connection setup error:", error);
      updateState({ status: WebSocketStatus.Error, isConnecting: false });
      stopHeartbeat();
      scheduleReconnect();
    }
  }, [
    canAttemptConnection,
    closeExistingConnection,
    cleanupWebSocketHandlers,
    startHeartbeat,
    stopHeartbeat,
    startHealthCheck,
    scheduleReconnect,
    updateLastMessageTime,
    updateState,
    isMobileLayout,
  ]);

  connectWebSocketRef.current = connectWebSocket;

  // Handle page visibility changes
  useEffect(() => {
    const wasInactive = !prevAppActiveRef.current;
    const isNowActive = isAppActive;
    prevAppActiveRef.current = isAppActive;

    if (!wasInactive || !isNowActive) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    const state = stateRef.current;
    if (state.shouldStopRetrying || state.isCleaningUp) {
      logDebug("Skipping visibility reconnect:  shouldStopRetrying is true");
      return;
    }

    const needsReconnection = !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN;

    if (needsReconnection && state.status !== WebSocketStatus.Connecting) {
      logInfo("Reconnecting WebSocket after page became visible");

      if (timersRef.current.connectionDebounce) {
        clearTimeout(timersRef.current.connectionDebounce);
      }

      timersRef.current.connectionDebounce = setTimeout(() => {
        const currentState = stateRef.current;
        if (!currentState.shouldStopRetrying && isAuthenticated && !currentState.isCleaningUp) {
          updateState({ reconnectAttempts: 0 });
          connectWebSocketRef.current?.();
        }
      }, CONFIG.CONNECTION_DEBOUNCE_DELAY);
    }
  }, [isAppActive, isAuthenticated, updateState]);

  // Handle network status changes
  useEffect(() => {
    const wasOffline = !prevNetworkConnectedRef.current;
    const isNowOnline = isNetworkConnected;
    prevNetworkConnectedRef.current = isNetworkConnected;

    if (!isNowOnline) {
      logInfo("Network connection lost");
      updateState({ status: WebSocketStatus.Disconnected });

      // Clear pending timers
      if (timersRef.current.reconnect) {
        clearTimeout(timersRef.current.reconnect);
        timersRef.current.reconnect = null;
      }

      if (timersRef.current.connectionDebounce) {
        clearTimeout(timersRef.current.connectionDebounce);
        timersRef.current.connectionDebounce = null;
      }

      closeExistingConnection("Network lost");
      updateState({ isConnecting: false });
      return;
    }

    if (isNowOnline && wasOffline) {
      if (!isAuthenticated) {
        return;
      }

      const state = stateRef.current;
      if (state.shouldStopRetrying || state.isCleaningUp) {
        logDebug("Skipping network reconnect: shouldStopRetrying is true");
        return;
      }

      logInfo("Network connection restored, reconnecting WebSocket");

      if (timersRef.current.connectionDebounce) {
        clearTimeout(timersRef.current.connectionDebounce);
      }

      timersRef.current.connectionDebounce = setTimeout(() => {
        const currentState = stateRef.current;
        if (!currentState.shouldStopRetrying && isAuthenticated && !currentState.isCleaningUp) {
          updateState({ reconnectAttempts: 0, isConnecting: false });
          connectWebSocketRef.current?.();
        }
      }, CONFIG.CONNECTION_DEBOUNCE_DELAY);
    }
  }, [isNetworkConnected, isAuthenticated, closeExistingConnection, updateState]);

  // Handle workspace changes
  useEffect(() => {
    const checkWorkspaceChange = async () => {
      if (!isAuthenticated || !isWorkspaceSelected) {
        return;
      }

      try {
        const { workspace } = await getAllTokens();

        if (currentWorkspaceRef.current && currentWorkspaceRef.current !== workspace) {
          logInfo("Workspace changed, reconnecting WebSocket.. .");
          closeExistingConnection("Workspace changed");
          updateState({ reconnectAttempts: 0, isConnecting: false, shouldStopRetrying: false });

          timersRef.current.connectionDebounce = setTimeout(() => {
            connectWebSocketRef.current?.();
          }, CONFIG.CONNECTION_DEBOUNCE_DELAY);
        }
      } catch (error) {
        logDebug("Error checking workspace change:", error);
      }
    };

    checkWorkspaceChange();
  }, [isAuthenticated, isWorkspaceSelected, closeExistingConnection, updateState]);

  useEffect(() => {
    if (!isAuthenticated) {
      updateState({
        status: WebSocketStatus.Disconnected,
        shouldStopRetrying: true,
        isConnecting: false,
        isCleaningUp: true,
      });
      clearAllTimers();
      closeExistingConnection("Authentication lost");
      updateState({ isCleaningUp: false });
      return;
    }

    // Reset state for new authentication
    updateState({
      shouldStopRetrying: false,
      reconnectAttempts: 0,
      isConnecting: false,
      isCleaningUp: false,
    });

    connectWebSocket();

    return () => {
      updateState({
        isCleaningUp: true,
        shouldStopRetrying: true,
        isConnecting: false,
      });
      clearAllTimers();
      closeExistingConnection("Component unmount");
      updateState({ status: WebSocketStatus.Disconnected });
    };
  }, [isAuthenticated, connectWebSocket, clearAllTimers, closeExistingConnection, updateState]);

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

      const deviceType = getDeviceType(isMobileLayout);
      const deviceId = await getDeviceId();
      return publishUserActivity(wsRef.current, { ...data, deviceType, deviceId });
    },
    [connectionStatus, isMobileLayout]
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

      if (!id) {
        logInfo("Cannot publish typing: missing userId");
        return false;
      }

      return publishTypingStatus(wsRef.current, {
        ...data,
        userId: id,
      });
    },
    [connectionStatus, id]
  );

  const forceReconnect = useCallback(() => {
    logInfo("Force reconnect requested");
    updateState({
      shouldStopRetrying: false,
      reconnectAttempts: 0,
      isConnecting: false,
    });
    closeExistingConnection("Force reconnect");

    setTimeout(() => {
      connectWebSocketRef.current?.();
    }, CONFIG.CONNECTION_DEBOUNCE_DELAY);
  }, [closeExistingConnection, updateState]);

  return {
    connectionStatus,
    publishActivity,
    publishTyping,
    forceReconnect,
  };
}
