import { ConversationType } from "@/types/chat/types";

export const USER_TOKEN_KEY = "userToken";
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const getDraftKey = (conversationId: number | string) => `draft_${conversationId}`;
export const MENTION_PREFIX = "@";
export const EMPTY_SET = new Set<number>();
export const WORKSPACE = "workspace";
export const X_TENANT = "X-Tenant";
export const X_UUID_HEADER = "x-Uuid";
export const DEVICE_ID_KEY = "Device-Id";
export const HEADER_DESTINATION = "destination";
export const HEADER_DEVICE_TYPE = "Device-Type";
export const HEADER_CONTENT_LENGTH = "content-length";
export const HEADER_CONTENT_TYPE = "content-type";
export const HEADER_AUTHORIZATION = "Authorization";
export const HEADER_WORKSPACE_ID = "Workspace-Id";
export const HEADER_HEART_BEAT = "heart-beat";
export const HEADER_ACCEPT_VERSION = "accept-version";
export const X_DEVICE_TYPE = "X-Device-Type";

export const TITLES = {
  ARCHIVE_CHAT: (conversationType: ConversationType) =>
    conversationType === ConversationType.ARCHIVED ? "Unarchive chat" : "Archive chat",
  TOGGLE_ROLE: (role: string) => (role === "ADMIN" ? "Remove Admin" : "Make Admin"),
  REMOVE_PARTICIPANT: "Remove participant",
  ADD_TO_FAVOURITES: "Add to favourites",
  REMOVE_FROM_FAVOURITES: "Remove from favourites",
  DELETE_CHAT: "Delete chat",
  PIN_CONVERSATION: "Pin Conversation",
  UNPIN_CONVERSATION: "Unpin Conversation",
  USER_ACTIVITY: "user activity",
  TYPING_ACTIVITY: "typing activity",
};

export const USER_NOT_CONFIRMED_ERROR = "Please confirm your account.";

export const SOUND_ENABLED_KEY = "sound_enabled";
