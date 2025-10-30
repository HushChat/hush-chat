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

import { ConversationType } from "@/types/chat/types";

export const USER_TOKEN_KEY = "userToken";
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const getDraftKey = (conversationId: number | string) =>
  `draft_${conversationId}`;
export const MENTION_PREFIX = "@";
export const EMPTY_SET = new Set<number>();

export const TITLES = {
  ARCHIVE_CHAT: (conversationType: ConversationType) =>
    conversationType === ConversationType.ARCHIVED
      ? "Unarchive chat"
      : "Archive chat",
  TOGGLE_ROLE: (role: string) =>
    role === "ADMIN" ? "Remove Admin" : "Make Admin",
  REMOVE_PARTICIPANT: "Remove participant",
  ADD_TO_FAVOURITES: "Add to favourites",
  REMOVE_FROM_FAVOURITES: "Remove from favourites",
  DELETE_CHAT: "Delete chat",
};

export const USER_NOT_CONFIRMED_ERROR = "Please confirm your account.";
