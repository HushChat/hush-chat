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

export interface TypingIndicator {
  conversationId: number;
  userId: string;
  isTyping: boolean;
  timestamp: string;
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
  deviceType?: "WEB" | "MOBILE";
}
