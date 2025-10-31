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
