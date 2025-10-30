/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import mitt from "mitt";
import {
  TypingIndicator,
  UserPresence,
  WebSocketError,
  NotificationPayload,
} from "@/types/ws/types";
import { IConversation } from "@/types/chat/types";

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

  // User presence events
  "user:presence": UserPresence;
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
//   console.error('❌ WebSocket error:', error);
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
