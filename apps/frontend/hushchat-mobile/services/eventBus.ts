import mitt from "mitt";
import {
  TypingIndicatorPayload,
  WebSocketError,
  NotificationPayload,
  MessageUnsentPayload,
  MessageReactionPayload,
  MessageReadPayload,
  MessagePinnedPayload,
} from "@/types/ws/types";
import { CallSignalPayload } from "@/types/call/callSignaling";
import { IConversation, IUserStatus, IMessage } from "@/types/chat/types";
import {
  CALL_EVENTS,
  CONVERSATION_EVENTS,
  NOTIFICATION_EVENTS,
  SYSTEM_EVENTS,
  USER_EVENTS,
  WEBSOCKET_EVENTS,
} from "@/constants/ws/webSocketEventKeys";

export type WebSocketEvents = {
  // Core WebSocket events
  [WEBSOCKET_EVENTS.MESSAGE]: IConversation;
  [WEBSOCKET_EVENTS.CONNECTED]: { timestamp: string };
  [WEBSOCKET_EVENTS.DISCONNECTED]: { reason?: string; timestamp: string };
  [WEBSOCKET_EVENTS.ERROR]: WebSocketError;
  [WEBSOCKET_EVENTS.RECONNECTING]: { attempt: number; maxAttempts: number };

  // Conversation-specific events
  [CONVERSATION_EVENTS.NEW_MESSAGE]: {
    conversationId: number;
    messageWithConversation: IConversation;
  };
  [CONVERSATION_EVENTS.TYPING]: TypingIndicatorPayload;
  [CONVERSATION_EVENTS.MESSAGE_READ]: MessageReadPayload;
  [CONVERSATION_EVENTS.MESSAGE_DELIVERED]: {
    conversationId: number;
    messageIds: string[];
    userId: string;
  };
  [CONVERSATION_EVENTS.CREATED]: IConversation;
  [CONVERSATION_EVENTS.MESSAGE_UNSENT]: MessageUnsentPayload;
  [CONVERSATION_EVENTS.MESSAGE_REACTION]: MessageReactionPayload;
  [CONVERSATION_EVENTS.MESSAGE_PINNED]: MessagePinnedPayload;
  [CONVERSATION_EVENTS.MESSAGE_UPDATED]: IMessage;

  // User presence events
  [USER_EVENTS.PRESENCE]: IUserStatus;
  [USER_EVENTS.JOINED]: { conversationId: number; user: { id: string; name: string } };
  [USER_EVENTS.LEFT]: { conversationId: number; userId: string };

  // Notification events
  [NOTIFICATION_EVENTS.SHOW]: NotificationPayload;
  [NOTIFICATION_EVENTS.CLEAR]: { conversationId?: number };

  // Call events
  [CALL_EVENTS.INCOMING]: {
    callId: string;
    from: string;
    conversationId: number;
    type: "voice" | "video";
  };
  [CALL_EVENTS.ENDED]: { callId: string; duration?: number };
  [CALL_EVENTS.REJECTED]: { callId: string; reason?: string };
  [CALL_EVENTS.SIGNAL]: CallSignalPayload;

  // System events
  [SYSTEM_EVENTS.MAINTENANCE]: { message: string; scheduledTime?: string };
  [SYSTEM_EVENTS.UPDATE]: { version: string; features: string[] };
};

// Create and export the event bus
export const eventBus = mitt<WebSocketEvents>();

// Helper functions for common operations
export const emitNewMessage = (messageWithConversation: IConversation) => {
  // Emit both general and conversation-specific events
  eventBus.emit(WEBSOCKET_EVENTS.MESSAGE, messageWithConversation);
  eventBus.emit(CONVERSATION_EVENTS.NEW_MESSAGE, {
    conversationId: messageWithConversation.id as number,
    messageWithConversation: messageWithConversation,
  });
};

export const emitUserStatus = (userStatus: IUserStatus) => {
  eventBus.emit(USER_EVENTS.PRESENCE, userStatus);
};

export const emitConversationCreated = (conversation: IConversation) => {
  eventBus.emit(CONVERSATION_EVENTS.CREATED, conversation);
};

export const emitMessageUnsent = (data: MessageUnsentPayload) => {
  eventBus.emit(CONVERSATION_EVENTS.MESSAGE_UNSENT, data);
};

export const emitMessageReaction = (data: MessageReactionPayload) => {
  eventBus.emit(CONVERSATION_EVENTS.MESSAGE_REACTION, data);
};

export const emitUserTyping = (typingIndicator: TypingIndicatorPayload) => {
  eventBus.emit(CONVERSATION_EVENTS.TYPING, typingIndicator);
};

export const emitMessageRead = (readStatus: MessageReadPayload) => {
  eventBus.emit(CONVERSATION_EVENTS.MESSAGE_READ, readStatus);
};

export const emitMessageUpdated = (message: IMessage) => {
  eventBus.emit(CONVERSATION_EVENTS.MESSAGE_UPDATED, message);
};

export const emitMessagePinned = (pinnedMessage: MessagePinnedPayload) => {
  eventBus.emit(CONVERSATION_EVENTS.MESSAGE_PINNED, pinnedMessage);
};

export const emitCallSignal = (signal: CallSignalPayload) => {
  eventBus.emit(CALL_EVENTS.SIGNAL, signal);
};

// export const emitConnectionStatus = (connected: boolean, reason?: string) => {
//   const timestamp = new Date().toISOString();
//
//   if (connected) {
//     console.debug('🔌 WebSocket connected');
//     eventBus.emit('websocket:connected', { timestamp });
//   } else {
//     console.debug('🔌 WebSocket disconnected:', reason);
//     eventBus.emit('websocket:disconnected', { reason, timestamp });
//   }
// };
//
// export const emitWebSocketError = (
//   error: Error,
//   type: WebSocketError['type'] = 'unknown',
//   conversationId?: number
// ) => {
//   logInfo('❌ WebSocket error:', error);
//
//   eventBus.emit('websocket:error', {
//     error,
//     conversationId,
//     timestamp: new Date().toISOString(),
//     type
//   });
// };
//
// export const emitTypingIndicator = (indicator: TypingIndicatorPayload) => {
//   eventBus.emit('conversation:typing', indicator);
// };
//
// export const emitUserPresence = (presence: UserPresence) => {
//   eventBus.emit('user:presence', presence);
// };
//
// export const emitNotification = (notification: NotificationPayload) => {
//   eventBus.emit('notification:show', notification);
// };
//
// // Debug helpers (remove in production)
// export const enableEventLogging = () => {
//   eventBus.on('*', (type, data) => {
//     console.debug(`🔥 Event: ${type}`, data);
//   });
// };

// Cleanup helper
export const removeAllListeners = () => {
  eventBus.all.clear();
};
