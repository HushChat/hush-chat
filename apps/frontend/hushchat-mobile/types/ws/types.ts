import { DeviceType } from "@/types/chat/types";

export interface WebSocketMessage {
  id: string;
  conversationId: number;
  content: string;
  senderId: string;
  timestamp: string;
  type: "text" | "image" | "file" | "system";
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    [key: string]: any;
  };
}

export interface TypingIndicatorPayload {
  conversationId: number;
  chatUserName: string;
  typing: boolean;
}

export interface MessageReadPayload {
  conversationId: number;
  lastSeenMessageId: number;
}

export interface MessagePinnedPayload {
  conversationId: number;
  pinnedMessage?: any;
}

export interface UserPresence {
  userId: string;
  status: "online" | "offline" | "away" | "busy";
  lastSeen?: string;
}

export interface WebSocketError {
  error: Error;
  conversationId?: number;
  timestamp: string;
  type: "connection" | "authentication" | "message" | "unknown";
}

export interface NotificationPayload {
  title: string;
  body: string;
  conversationId?: number;
  userId?: string;
  type: "message" | "call" | "system";
  data?: any;
}

export enum WebSocketStatus {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Error = "error",
}

export interface UserActivityWSSubscriptionData {
  workspaceId: string;
  email: string;
  visibleConversations: number[]; // list of conversations visible - mobile or web
  openedConversation: number | null; // indicates user's selected conversation, could be null
  deviceType?: DeviceType;
  deviceId?: string;
}

export interface TypingIndicatorWSData {
  userId?: number;
  conversationId: number;
  typing: boolean; // true = started typing, false = stopped
}

export interface MessageUnsentPayload {
  conversationId: number;
  messageId: number;
  actorUserId: number;
}

export enum MessageReactionActionEnum {
  ADDED = "ADDED",
  UPDATED = "UPDATED",
  REMOVED = "REMOVED",
}

export interface MessageReactionPayload {
  conversationId: number;
  messageId: number;
  actorUserId: number;
  reactionType: string | null;
  previousReactionType?: string | null;
  reactionAction: MessageReactionActionEnum;
}

export interface ConnectionState {
  status: WebSocketStatus;
  reconnectAttempts: number;
  shouldStopRetrying: boolean;
  isConnecting: boolean;
  isCleaningUp: boolean;
  isIntentionalClose: boolean;
  lastMessageTime: number;
}
export const initialConnectionState: ConnectionState = {
  status: WebSocketStatus.Disconnected,
  reconnectAttempts: 0,
  shouldStopRetrying: false,
  isConnecting: false,
  isCleaningUp: false,
  isIntentionalClose: false,
  lastMessageTime: 0,
};
