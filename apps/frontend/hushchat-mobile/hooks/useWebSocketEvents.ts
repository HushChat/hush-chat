import { useEffect, useState, useCallback } from "react";
import { eventBus } from "@/services/eventBus";
// import { TypingIndicator, UserPresence, WebSocketError } from '@/types/ws/types';
import { IConversation, IMessage } from "@/types/chat/types";
import { playMessageSound } from "@/utils/playSound";

// Hook for listening to messages for a specific conversation
export const useConversationMessages = (conversationId: number) => {
  const [lastMessage, setLastMessage] = useState<IMessage | null>(null);

  useEffect(() => {
    const handleNewMessage = ({
      conversationId: msgConversationId,
      messageWithConversation,
    }: {
      conversationId: number;
      messageWithConversation: IConversation;
    }) => {
      if (msgConversationId === conversationId) {
        setLastMessage(messageWithConversation.messages[0]);
      }
    };

    eventBus.on("conversation:newMessage", handleNewMessage);

    return () => {
      eventBus.off("conversation:newMessage", handleNewMessage);
    };
  }, [conversationId]);

  // Clear messages when conversation changes
  useEffect(() => {
    setLastMessage(null);
  }, [conversationId]);

  const clearMessages = useCallback(() => {
    setLastMessage(null);
  }, []);

  return {
    lastMessage,
    clearMessages,
  };
};

// Hook for listening to notifications for conversations list
export const useConversationsNotifications = () => {
  const [notificationReceivedConversation, setNotificationReceivedConversation] =
    useState<IConversation | null>(null);

  useEffect(() => {
    const handleWebSocketMessage = (messageWithConversation: IConversation) => {
      const doesConversationListShouldBeUpdated =
        messageWithConversation?.id && !messageWithConversation.archivedByLoggedInUser;
      if (doesConversationListShouldBeUpdated) {
        setNotificationReceivedConversation(messageWithConversation);

        if (!messageWithConversation.mutedByLoggedInUser) {
          playMessageSound();
        }
      }
    };

    eventBus.on("websocket:message", handleWebSocketMessage);

    // Cleanup function - removes the event listener
    return () => {
      eventBus.off("websocket:message", handleWebSocketMessage);
    };
  }, []);

  // Clear messages when remount
  useEffect(() => {
    setNotificationReceivedConversation(null);
  }, []);

  const clearConversation = useCallback(() => {
    setNotificationReceivedConversation(null);
  }, []);

  return {
    notificationReceivedConversation,
    clearConversation,
  };
};

// Hook for WebSocket connection status
// export const useWebSocketConnection = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastError, setLastError] = useState<WebSocketError | null>(null);
//   const [connectionTime, setConnectionTime] = useState<string | null>(null);
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);
//
//   useEffect(() => {
//     const handleConnected = ({ timestamp }: { timestamp: string }) => {
//       setIsConnected(true);
//       setLastError(null);
//       setConnectionTime(timestamp);
//       setReconnectAttempts(0);
//       console.debug('✅ WebSocket connected at:', timestamp);
//     };
//
//     const handleDisconnected = ({ reason, timestamp }: { reason?: string; timestamp: string }) => {
//       setIsConnected(false);
//       setConnectionTime(null);
//       console.debug('❌ WebSocket disconnected at:', timestamp, 'Reason:', reason);
//     };
//
//     const handleError = (error: WebSocketError) => {
//       setLastError(error);
//       if (error.type === 'connection') {
//         setReconnectAttempts((prev) => prev + 1);
//       }
//       console.error('🚨 WebSocket error:', error);
//     };
//
//     const handleReconnecting = ({
//       attempt,
//       maxAttempts,
//     }: {
//       attempt: number;
//       maxAttempts: number;
//     }) => {
//       setReconnectAttempts(attempt);
//       console.debug(`🔄 Reconnecting... (${attempt}/${maxAttempts})`);
//     };
//
//     eventBus.on('websocket:connected', handleConnected);
//     eventBus.on('websocket:disconnected', handleDisconnected);
//     eventBus.on('websocket:error', handleError);
//     eventBus.on('websocket:reconnecting', handleReconnecting);
//
//     return () => {
//       eventBus.off('websocket:connected', handleConnected);
//       eventBus.off('websocket:disconnected', handleDisconnected);
//       eventBus.off('websocket:error', handleError);
//       eventBus.off('websocket:reconnecting', handleReconnecting);
//     };
//   }, []);
//
//   const clearError = useCallback(() => {
//     setLastError(null);
//   }, []);
//
//   return {
//     isConnected,
//     lastError,
//     connectionTime,
//     reconnectAttempts,
//     clearError,
//   };
// };
//
// // Hook for typing indicators in a conversation
// export const useTypingIndicators = (conversationId: number) => {
//   const [typingUsers, setTypingUsers] = useState<string[]>([]);
//   const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
//
//   useEffect(() => {
//     const handleTyping = ({
//       conversationId: typingConversationId,
//       userId,
//       isTyping,
//     }: TypingIndicator) => {
//       if (typingConversationId === conversationId) {
//         setTypingUsers((prev) => {
//           if (isTyping) {
//             // Clear existing timeout for this user
//             const existingTimeout = typingTimeouts.current.get(userId);
//             if (existingTimeout) {
//               clearTimeout(existingTimeout);
//             }
//
//             // Set new timeout to auto-remove typing indicator
//             const timeout = setTimeout(() => {
//               setTypingUsers((current) => current.filter((id) => id !== userId));
//               typingTimeouts.current.delete(userId);
//             }, 5000); // Remove typing indicator after 5 seconds
//
//             typingTimeouts.current.set(userId, timeout);
//
//             return prev.includes(userId) ? prev : [...prev, userId];
//           } else {
//             // Clear timeout when user stops typing
//             const existingTimeout = typingTimeouts.current.get(userId);
//             if (existingTimeout) {
//               clearTimeout(existingTimeout);
//               typingTimeouts.current.delete(userId);
//             }
//
//             return prev.filter((id) => id !== userId);
//           }
//         });
//       }
//     };
//
//     eventBus.on('conversation:typing', handleTyping);
//
//     return () => {
//       eventBus.off('conversation:typing', handleTyping);
//       // Clear all timeouts
//       typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
//       typingTimeouts.current.clear();
//       setTypingUsers([]);
//     };
//   }, [conversationId]);
//
//   return typingUsers;
// };
//
// // Hook for user presence status
// export const useUserPresence = (userIds?: string[]) => {
//   const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
//
//   useEffect(() => {
//     const handlePresence = (presence: UserPresence) => {
//       // If userIds is provided, only track those users
//       if (!userIds || userIds.includes(presence.userId)) {
//         setPresenceMap((prev) => new Map(prev.set(presence.userId, presence)));
//       }
//     };
//
//     eventBus.on('user:presence', handlePresence);
//
//     return () => {
//       eventBus.off('user:presence', handlePresence);
//     };
//   }, [userIds]);
//
//   const getUserPresence = useCallback(
//     (userId: string): UserPresence | undefined => {
//       return presenceMap.get(userId);
//     },
//     [presenceMap],
//   );
//
//   const isUserOnline = useCallback(
//     (userId: string): boolean => {
//       const presence = presenceMap.get(userId);
//       return presence?.status === 'online';
//     },
//     [presenceMap],
//   );
//
//   return {
//     presenceMap,
//     getUserPresence,
//     isUserOnline,
//     onlineUsers: Array.from(presenceMap.values()).filter((p) => p.status === 'online'),
//   };
// };
//
// // Hook for global WebSocket messages (useful for notifications, etc.)
// export const useGlobalWebSocketMessages = () => {
//   const [allMessages, setAllMessages] = useState<IMessage[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [messagesByConversation, setMessagesByConversation] = useState<
//     Map<number, IMessage[]>
//   >(new Map());
//
//   useEffect(() => {
//     const handleMessage = (message: IMessage) => {
//       setAllMessages((prev) => {
//         const exists = prev.some((msg) => msg.id === message.id);
//         if (exists) return prev;
//         return [...prev, message];
//       });
//
//       setMessagesByConversation((prev) => {
//         const conversationMessages = prev.get(message.conversationId) || [];
//         const exists = conversationMessages.some((msg) => msg.id === message.id);
//         if (!exists) {
//           const updated = new Map(prev);
//           updated.set(message.conversationId, [...conversationMessages, message]);
//           return updated;
//         }
//         return prev;
//       });
//
//       setUnreadCount((prev) => prev + 1);
//     };
//
//     eventBus.on('websocket:message', handleMessage);
//
//     return () => {
//       eventBus.off('websocket:message', handleMessage);
//     };
//   }, []);
//
//   const markAsRead = useCallback(
//     (conversationId?: number) => {
//       if (conversationId) {
//         const conversationMessages = messagesByConversation.get(conversationId) || [];
//         setUnreadCount((prev) => Math.max(0, prev - conversationMessages.length));
//       } else {
//         setUnreadCount(0);
//       }
//     },
//     [messagesByConversation],
//   );
//
//   const getMessagesForConversation = useCallback(
//     (conversationId: number): IMessage[] => {
//       return messagesByConversation.get(conversationId) || [];
//     },
//     [messagesByConversation],
//   );
//
//   const clearAllMessages = useCallback(() => {
//     setAllMessages([]);
//     setMessagesByConversation(new Map());
//     setUnreadCount(0);
//   }, []);
//
//   return {
//     allMessages,
//     unreadCount,
//     messagesByConversation,
//     markAsRead,
//     getMessagesForConversation,
//     clearAllMessages,
//   };
// };
//
// // Hook for notifications
// export const useNotifications = () => {
//   const [notifications, setNotifications] = useState<
//     Array<{ id: string; payload: any; timestamp: string }>
//   >([]);
//
//   useEffect(() => {
//     const handleNotification = (payload: any) => {
//       const notification = {
//         id: `notif-${Date.now()}-${Math.random()}`,
//         payload,
//         timestamp: new Date().toISOString(),
//       };
//
//       setNotifications((prev) => [...prev, notification]);
//
//       // Auto-remove notification after 5 seconds
//       setTimeout(() => {
//         setNotifications((current) => current.filter((n) => n.id !== notification.id));
//       }, 5000);
//     };
//
//     eventBus.on('notification:show', handleNotification);
//
//     return () => {
//       eventBus.off('notification:show', handleNotification);
//     };
//   }, []);
//
//   const clearNotification = useCallback((id: string) => {
//     setNotifications((prev) => prev.filter((n) => n.id !== id));
//   }, []);
//
//   const clearAllNotifications = useCallback(() => {
//     setNotifications([]);
//   }, []);
//
//   return {
//     notifications,
//     clearNotification,
//     clearAllNotifications,
//   };
// };
