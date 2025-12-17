/**
 * WebSocket / EventBus event keys
 *
 * These constants are the single source of truth for all
 * mitt-based websocket and realtime events.
 *
 * Naming convention:
 *   <domain>:<action>
 */
export const WEBSOCKET_EVENTS = {
  // Core WebSocket lifecycle
  MESSAGE: "websocket:message",
  CONNECTED: "websocket:connected",
  DISCONNECTED: "websocket:disconnected",
  ERROR: "websocket:error",
  RECONNECTING: "websocket:reconnecting",
} as const;

export const CONVERSATION_EVENTS = {
  NEW_MESSAGE: "conversation:newMessage",
  TYPING: "conversation:typing",
  MESSAGE_READ: "conversation:messageRead",
  MESSAGE_DELIVERED: "conversation:messageDelivered",
  CREATED: "conversation:created",
} as const;

export const USER_EVENTS = {
  PRESENCE: "user:presence",
  JOINED: "user:joined",
  LEFT: "user:left",
} as const;

export const NOTIFICATION_EVENTS = {
  SHOW: "notification:show",
  CLEAR: "notification:clear",
} as const;

export const CALL_EVENTS = {
  INCOMING: "call:incoming",
  ENDED: "call:ended",
  REJECTED: "call:rejected",
} as const;

export const SYSTEM_EVENTS = {
  MAINTENANCE: "system:maintenance",
  UPDATE: "system:update",
} as const;
