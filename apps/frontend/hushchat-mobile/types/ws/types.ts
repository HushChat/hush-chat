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
