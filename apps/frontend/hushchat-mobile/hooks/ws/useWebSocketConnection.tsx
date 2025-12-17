import { useAuthStore } from "@/store/auth/authStore";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { getAllTokens } from "@/utils/authUtils";
import { getWSBaseURL } from "@/utils/apiUtils";
import {
  emitConversationCreated,
  emitMessageReaction,
  emitMessageUnsent,
  emitNewMessage,
  emitUserStatus,
} from "@/services/eventBus";
import { IConversation, IUserStatus } from "@/types/chat/types";
import {
  CONNECTED_RESPONSE,
  CONVERSATION_CREATED_TOPIC,
  ERROR_RESPONSE,
  MESSAGE_REACTION_TOPIC,
  MESSAGE_RECEIVED_TOPIC,
  MESSAGE_RESPONSE,
  MESSAGE_UNSENT_TOPIC,
  ONLINE_STATUS_TOPIC,
  RETRY_TIME_MS,
} from "@/constants/wsConstants";
import {
  MessageReactionPayload,
  MessageUnsentPayload,
  UserActivityWSSubscriptionData,
  WebSocketStatus,
} from "@/types/ws/types";
import { logDebug, logInfo } from "@/utils/logger";
import { extractTopicFromMessage, subscribeToTopic, validateToken } from "@/hooks/ws/WSUtilService";

// Define topics to subscribe to
const TOPICS = [
  { destination: MESSAGE_RECEIVED_TOPIC, id: "sub-messages" },
  { destination: ONLINE_STATUS_TOPIC, id: "sub-online-status" },
  { destination: CONVERSATION_CREATED_TOPIC, id: "sub-conversation-created" },
  { destination: MESSAGE_UNSENT_TOPIC, id: "sub-message-unsent" },
  { destination: MESSAGE_REACTION_TOPIC, id: "sub-message-reaction" },
];

export const publishUserActivity = (
  ws: WebSocket | null,
  data: UserActivityWSSubscriptionData
): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    logInfo("WebSocket not connected, cannot publish user activity");
    return false;
  }

  try {
    const body = JSON.stringify(data);

    const sendFrameBytes = [
      ...Array.from(new TextEncoder().encode("SEND\n")),
      ...Array.from(new TextEncoder().encode("destination:/app/subscribed-conversations\n")),
      ...Array.from(new TextEncoder().encode(`content-length:${body.length}\n`)),
      ...Array.from(new TextEncoder().encode("content-type:application/json\n")),
      0x0a, // empty line
      ...Array.from(new TextEncoder().encode(body)),
      0x00, // null terminator
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
      // Handle message received
      const wsMessageWithConversation = JSON.parse(body) as IConversation;
      if (wsMessageWithConversation.messages?.length !== 0) {
        emitNewMessage(wsMessageWithConversation);
      }
    } else if (topic.includes(ONLINE_STATUS_TOPIC)) {
      // Handle online status update
      const onlineStatusData = JSON.parse(body) as IUserStatus;
      emitUserStatus(onlineStatusData);
    } else if (topic.includes(CONVERSATION_CREATED_TOPIC)) {
      // Handle group conversation creation
      const newConversation = JSON.parse(body) as IConversation;
      emitConversationCreated(newConversation);
    } else if (topic.includes(MESSAGE_UNSENT_TOPIC)) {
      // Handle message unsent
      const data = JSON.parse(body) as MessageUnsentPayload;
      emitMessageUnsent(data);
    } else if (topic.includes(MESSAGE_REACTION_TOPIC)) {
      // Handle message reaction
      const data = JSON.parse(body) as MessageReactionPayload;
      emitMessageReaction(data);
    } else {
      logDebug("Received message from unknown topic:", topic);
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

    const fetchAndSubscribe = async () => {
      if (shouldStopRetrying.current || isCancelled) {
        logInfo("Stopping WebSocket connection attempts due to authentication failure");
        setConnectionStatus(WebSocketStatus.Disconnected);
        return;
      }

      try {
        setConnectionStatus(WebSocketStatus.Connecting);

        const { idToken, workspace } = await getAllTokens();
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

            // Subscribe to all topics
            TOPICS.forEach((topic) => {
              subscribeToTopic(ws, topic.destination, topic.id);
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

  const publishActivity = (data: UserActivityWSSubscriptionData) => {
    if (connectionStatus !== WebSocketStatus.Connected) {
      logInfo("Cannot publish activity: WebSocket not connected", {
        status: connectionStatus,
      });
      return false;
    }
    return publishUserActivity(wsRef.current, data);
  };

  // return the connection status
  return { connectionStatus, publishActivity };
}
