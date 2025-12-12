import { useAuthStore } from "@/store/auth/authStore";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { getAllTokens } from "@/utils/authUtils";
import { getWSBaseURL } from "@/utils/apiUtils";
import { emitNewMessage, emitUserStatus } from "@/services/eventBus";
import { IConversation, IUserStatus } from "@/types/chat/types";
import {
  CONNECTED_RESPONSE,
  ERROR_RESPONSE,
  MESSAGE_RECEIVED_TOPIC,
  MESSAGE_RESPONSE,
  ONLINE_STATUS_TOPIC,
  RETRY_TIME_MS,
} from "@/constants/wsConstants";
import { UserActivityWSSubscriptionData, WebSocketStatus } from "@/types/ws/types";
import { logInfo } from "@/utils/logger";
import { extractTopicFromMessage, subscribeToTopic, validateToken } from "@/hooks/ws/WSUtilService";
import { Platform, AppState, AppStateStatus } from "react-native";

const TOPICS = [
  { destination: MESSAGE_RECEIVED_TOPIC, id: "sub-messages" },
  { destination: ONLINE_STATUS_TOPIC, id: "sub-online-status" },
];

const getDeviceType = () => {
  if (Platform.OS === "web") return "WEB";
  return "MOBILE";
};

/**
 * Request permission for Web Browser Notifications
 */
const requestWebNotificationPermission = () => {
  if (Platform.OS === "web" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
};

/**
 * Show a browser notification
 */
const showWebNotification = (title: string, body: string) => {
  if (Platform.OS === "web" && "Notification" in window && Notification.permission === "granted") {
    // Only show if the tab is hidden/backgrounded
    if (document.hidden) {
      new Notification(title, { body, icon: "/icon.png" });
    }
  }
};

export const publishUserActivity = (
  ws: WebSocket | null,
  data: UserActivityWSSubscriptionData
): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;

  const currentDeviceType = getDeviceType();

  try {
    const body = JSON.stringify({ ...data, deviceType: currentDeviceType });

    const sendFrameBytes = [
      ...Array.from(new TextEncoder().encode("SEND\n")),
      ...Array.from(new TextEncoder().encode("destination:/app/subscribed-conversations\n")),
      ...Array.from(new TextEncoder().encode(`device-type:${currentDeviceType}\n`)),
      ...Array.from(new TextEncoder().encode(`content-length:${body.length}\n`)),
      ...Array.from(new TextEncoder().encode("content-type:application/json\n")),
      0x0a,
      ...Array.from(new TextEncoder().encode(body)),
      0x00,
    ];

    const uint8Array = new Uint8Array(sendFrameBytes);
    ws.send(uint8Array.buffer);
    return true;
  } catch (error) {
    logInfo("Error publishing user activity:", error);
    return false;
  }
};

// Handle different message types based on topic
const handleMessageByTopic = (topic: string, body: string) => {
  try {
    if (topic.includes(MESSAGE_RECEIVED_TOPIC)) {
      const wsMessageWithConversation = JSON.parse(body) as IConversation;

      if (wsMessageWithConversation.messages?.length !== 0) {
        emitNewMessage(wsMessageWithConversation);

        const latestMessageObj = wsMessageWithConversation.messages?.[0];

        if (latestMessageObj) {
          const messageContent = (latestMessageObj as any).content || "New message";
          showWebNotification("New Message", messageContent);
        }
      }
    } else if (topic.includes(ONLINE_STATUS_TOPIC)) {
      const onlineStatusData = JSON.parse(body) as IUserStatus;
      emitUserStatus(onlineStatusData);
    }
  } catch (error) {
    logInfo("Error parsing message from topic:", topic, error);
  }
};

export default function useWebSocketConnection() {
  const { isAuthenticated } = useAuthStore();
  const {
    user: { email },
  } = useUserStore();
  const wsRef = useRef<WebSocket | null>(null);
  const shouldStopRetrying = useRef(false);
  const isAppBackgrounded = useRef(false);

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>(
    WebSocketStatus.Disconnected
  );

  // Request notification permission on mount
  useEffect(() => {
    requestWebNotificationPermission();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnectionStatus(WebSocketStatus.Disconnected);
      return;
    }

    let isCancelled = false;
    shouldStopRetrying.current = false;
    isAppBackgrounded.current = false;

    const mainServiceWsBaseUrl = getWSBaseURL();

    const fetchAndSubscribe = async () => {
      // Don't connect if app is backgrounded (MOBILE ONLY)
      if (shouldStopRetrying.current || isCancelled || isAppBackgrounded.current) {
        return;
      }

      try {
        setConnectionStatus(WebSocketStatus.Connecting);
        const { idToken, workspace } = await getAllTokens();

        if (!idToken || !validateToken(idToken)) {
          shouldStopRetrying.current = true;
          setConnectionStatus(WebSocketStatus.Error);
          return;
        }

        const wsUrl = `${mainServiceWsBaseUrl}/ws-message-subscription`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          const deviceType = getDeviceType();

          // Send CONNECT frame
          const connectFrameBytes = [
            ...Array.from(new TextEncoder().encode("CONNECT\n")),
            ...Array.from(new TextEncoder().encode(`Authorization:Bearer ${idToken}\n`)),
            ...Array.from(new TextEncoder().encode(`Workspace-Id:${workspace}\n`)),
            ...Array.from(new TextEncoder().encode(`Device-Type:${deviceType}\n`)),
            ...Array.from(new TextEncoder().encode("accept-version:1.2\n")),
            ...Array.from(new TextEncoder().encode("heart-beat:10000,10000\n")),
            0x0a,
            0x00,
          ];
          ws.send(new Uint8Array(connectFrameBytes).buffer);
        };

        ws.onmessage = (event) => {
          if (event.data.startsWith(CONNECTED_RESPONSE)) {
            setConnectionStatus(WebSocketStatus.Connected);
            TOPICS.forEach((topic) => subscribeToTopic(ws, topic.destination, email, topic.id));
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
          } else if (event.data.startsWith(ERROR_RESPONSE)) {
            const errorMessage = event.data.toLowerCase();
            if (errorMessage.includes("unauthorized") || errorMessage.includes("token")) {
              shouldStopRetrying.current = true;
            }
          }
        };

        ws.onclose = (event) => {
          setConnectionStatus(WebSocketStatus.Disconnected);
          if (event.code === 1002 || event.code === 1008 || event.code === 3401) {
            shouldStopRetrying.current = true;
            return;
          }
          // Reconnect on all other disconnections (including after errors)
          if (!isCancelled && !shouldStopRetrying.current && !isAppBackgrounded.current) {
            setTimeout(fetchAndSubscribe, RETRY_TIME_MS);
          }
        };
      } catch (error) {
        logInfo("Connection setup error:", error);
        setConnectionStatus(WebSocketStatus.Error);
        if (!isCancelled && !shouldStopRetrying.current && !isAppBackgrounded.current) {
          setTimeout(fetchAndSubscribe, RETRY_TIME_MS);
        }
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // ONLY APPLY BACKGROUND DISCONNECT LOGIC ON MOBILE
      if (Platform.OS !== "web") {
        if (nextAppState.match(/inactive|background/)) {
          logInfo("Mobile App backgrounded - closing socket");
          isAppBackgrounded.current = true;
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }
        } else if (nextAppState === "active") {
          logInfo("Mobile App active - reconnecting socket");
          isAppBackgrounded.current = false;
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            fetchAndSubscribe();
          }
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    void fetchAndSubscribe();

    return () => {
      isCancelled = true;
      shouldStopRetrying.current = false;
      subscription.remove();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnectionStatus(WebSocketStatus.Disconnected);
    };
  }, [email, isAuthenticated]);

  const publishActivity = (data: UserActivityWSSubscriptionData) => {
    if (connectionStatus !== WebSocketStatus.Connected) return false;
    return publishUserActivity(wsRef.current, data);
  };

  return { connectionStatus, publishActivity };
}
