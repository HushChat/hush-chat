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

import type { ConversationFilterCriteria } from "@/apis/conversation";

const CALL_LOGS = "call-logs";
const GROUP_INFO = "group-info";

const CONVERSATION_QUERY_BASE_KEY = "conversations";
const CONVERSATION_MESSAGE_QUERY_BASE_KEY = "conversation-messages";
const MESSAGE_REACTION_QUERY_BASE_KEY = "message-reactions";
const USER_QUERY_BASE_KEY = "users";

export const conversationQueryKeys = {
  metaDataById: (userId: number, conversationId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    "meta",
    userId,
  ],

  allConversations: (userId: number, criteria: ConversationFilterCriteria) => [
    CONVERSATION_QUERY_BASE_KEY,
    userId,
    criteria,
  ],

  participantProfileInfo: (userId: number, conversationId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    "profile",
    userId,
  ],

  groupProfileInfo: (userId: number, conversationId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    GROUP_INFO,
    userId,
  ],

  ConversationParticipants: (conversationId: number, keyword: string) => [
    CONVERSATION_QUERY_BASE_KEY,
    keyword,
    conversationId,
  ],

  ConversationParticipant: (conversationId: number, participantId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    participantId,
  ],
};

export const conversationMessageQueryKeys = {
  messages: (userId: number, conversationId: number) => [
    CONVERSATION_MESSAGE_QUERY_BASE_KEY,
    conversationId,
    userId,
  ],

  messageReactions: (messageId: number) => [
    MESSAGE_REACTION_QUERY_BASE_KEY,
    messageId,
  ],
};

export const userQueryKeys = {
  callLogs: (userId: number) => [USER_QUERY_BASE_KEY, CALL_LOGS, userId],

  userProfile: (userId: number) => [USER_QUERY_BASE_KEY, userId],
};
