import mitt from "mitt";
import { TypingIndicator, WebSocketError, NotificationPayload } from "@/types/ws/types";
import { IConversation, IUserStatus } from "@/types/chat/types";

export type WebSocketEvents = {
  // Core WebSocket events
  "websocket:message": IConversation;
  "websocket:connected": { timestamp: string };
  "websocket:disconnected": { reason?: string; timestamp: string };
  "websocket:error": WebSocketError;
  "websocket:reconnecting": { attempt: number; maxAttempts: number };

  // Conversation-specific events
  "conversation:newMessage": {
    conversationId: number;
    messageWithConversation: IConversation;
  };
  "conversation:typing": TypingIndicator;
  "conversation:messageRead": {
    conversationId: number;
    messageIds: string[];
    userId: string;
  };
  "conversation:messageDelivered": {
    conversationId: number;
    messageIds: string[];
    userId: string;
  };
  "conversation:created": IConversation;

  // User presence events
  "user:presence": IUserStatus;
  "user:joined": { conversationId: number; user: { id: string; name: string } };
  "user:left": { conversationId: number; userId: string };

  // Notification events
  "notification:show": NotificationPayload;
  "notification:clear": { conversationId?: number };

  // Call events (if you have voice/video calling)
  "call:incoming": {
    callId: string;
    from: string;
    conversationId: number;
    type: "voice" | "video";
  };
  "call:ended": { callId: string; duration?: number };
  "call:rejected": { callId: string; reason?: string };

  // System events
  "system:maintenance": { message: string; scheduledTime?: string };
  "system:update": { version: string; features: string[] };
};

// Create and export the event bus
export const eventBus = mitt<WebSocketEvents>();

// Helper functions for common operations
export const emitNewMessage = (messageWithConversation: IConversation) => {
  // Emit both general and conversation-specific events
  eventBus.emit("websocket:message", messageWithConversation);
  eventBus.emit("conversation:newMessage", {
    conversationId: messageWithConversation.id as number,
    messageWithConversation: messageWithConversation,
  });
};

export const emitUserStatus = (userStatus: IUserStatus) => {
  eventBus.emit("user:presence", userStatus);
};

export const emitConversationCreated = (conversation: any) => {
  eventBus.emit("conversation:created", conversation);
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
// export const emitTypingIndicator = (indicator: TypingIndicator) => {
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
